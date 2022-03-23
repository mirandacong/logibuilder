// tslint:disable: max-file-line-count
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    Output,
    QueryList,
    Renderer2,
    ViewChildren,
} from '@angular/core'
import {Observable, OperatorFunction, Subject, Subscriber} from 'rxjs'
import {debounceTime} from 'rxjs/operators'

import {SplitAreaDirective} from './directive'
import {
    Area,
    AreaAbsorptionCapacity,
    AreaSnapshot,
    Direction,
    OutputAreaSizes,
    OutputData,
    Point,
    SplitSnapshot,
} from './interface'
import {
    getAreaMaxSize,
    getAreaMinSize,
    getElementPixelSize,
    getGutterSideAbsorptionCapacity,
    getInputBoolean,
    getInputPositiveNumber,
    getPointFromEvent,
    isUserSizesValid,
    updateAreaSize,
} from './utils'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-split',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SplitComponent implements AfterViewInit, OnDestroy {
    @Input() public set direction(v: Direction) {
        this._direction = (v === 'vertical') ? 'vertical' : 'horizontal'

        this._renderer.addClass(
            this._el.nativeElement,
            `as-${ this._direction }`,
        )
        this._renderer.removeClass(
            this._el.nativeElement,
            `as-${ (this._direction === 'vertical') ?
            'horizontal' : 'vertical' }`,
        )

        this._build(false, false)
    }

    // tslint:disable: ng-no-get-and-set-property
    public get direction(): Direction {
        return this._direction
    }

    @Input() public set unit(v: 'percent' | 'pixel') {
        this._unit = (v === 'pixel') ? 'pixel' : 'percent'
        this._renderer.addClass(this._el.nativeElement, `as-${ this._unit }`)
        this._renderer.removeClass(
            this._el.nativeElement,
            `as-${ (this._unit === 'pixel') ? 'percent' : 'pixel' }`,
        )
        this._build(false, true)
    }

    public get unit(): 'percent' | 'pixel' {
        return this._unit
    }

    @Input() public set gutterSize(v: number) {
        const defaultSize = 11
        this._gutterSize = getInputPositiveNumber(v, defaultSize)

        this._build(false, false)
    }

    public get gutterSize(): number {
        return this._gutterSize
    }

    @Input() public set gutterStep(v: number) {
        this._gutterStep = getInputPositiveNumber(v, 1)
    }

    public get gutterStep(): number {
        return this._gutterStep
    }

    /*
     * Set to true if you want to limit gutter move to adjacent areas only.
     */
    @Input() public set restrictMove(v: boolean) {
        this._restrictMove = getInputBoolean(v)
    }

    public get restrictMove(): boolean {
        return this._restrictMove
    }

    @Input() public set useTransition(v: boolean) {
        this._useTransition = getInputBoolean(v)

        if (this._useTransition)
            this._renderer.addClass(this._el.nativeElement, 'as-transition')
        else
            this._renderer.removeClass(this._el.nativeElement, 'as-transition')
    }

    public get useTransition(): boolean {
        return this._useTransition
    }

    @Input() public set disabled(v: boolean) {
        this._disabled = getInputBoolean(v)

        if (this._disabled)
            this._renderer.addClass(this._el.nativeElement, 'as-disabled')
        else
            this._renderer.removeClass(this._el.nativeElement, 'as-disabled')
    }

    public get disabled(): boolean {
        return this._disabled
    }

    @Input() public set dir(v: 'ltr' | 'rtl') {
        this._dir = (v === 'rtl') ? 'rtl' : 'ltr'

        this._renderer.setAttribute(this._el.nativeElement, 'dir', this._dir)
    }

    public get dir(): 'ltr' | 'rtl' {
        return this._dir
    }

    @Input() public set gutterDblClickDuration(v: number) {
        this._gutterDblClickDuration = getInputPositiveNumber(v, 0)
    }

    public get gutterDblClickDuration(): number {
        return this._gutterDblClickDuration
    }

    @Output() public get transitionEnd(): Observable<OutputAreaSizes> {
        const deBounceTime = 20
        // tslint:disable-next-line: ter-newline-after-var
        const subscriber = (s: Subscriber<OutputAreaSizes>):
            Subscriber<OutputAreaSizes> => this._transitionEndSubscriber = s

        return new Observable(subscriber).pipe(
            debounceTime<OutputAreaSizes>(deBounceTime) as
                OperatorFunction<unknown, OutputAreaSizes>,
        )
    }

    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _el: ElementRef,
        private readonly _ngZone: NgZone,
        private readonly _renderer: Renderer2) {
        /**
         * To force adding default class, could be override by user @Input() or
         * not
         */
        this.direction = this._direction
        this.dragProgress$ = this._dragProgressSubject$.asObservable()
    }

    @Output() public readonly dragStart$ = new EventEmitter<OutputData>(false)
    @Output() public readonly dragEnd$ = new EventEmitter<OutputData>(false)
    @Output() public readonly gutterClick$ = new EventEmitter<OutputData>(false)
    @Output() public readonly gutterDblClick$ =
        new EventEmitter<OutputData>(false)
    public dragProgress$: Observable<OutputData>

    // tslint:disable-next-line: readonly-array
    public readonly displayedAreas: Area[] = []

    public _clickTimeout: number | undefined
    public el(): HTMLElement {
        return this._el.nativeElement
    }

    public ngAfterViewInit(): void {
        this._ngZone.runOutsideAngular((): void => {
            // To avoid transition at first rendering
            setTimeout((): void => this._renderer.addClass(
                this._el.nativeElement,
                'as-init',
            ))
        })
    }

    public addArea(component: SplitAreaDirective): void {
        const newArea: Area = {
            component,
            maxSize: undefined,
            minSize: undefined,
            order: 0,
            size: 0,
        }
        if (component.visible) {
            this.displayedAreas.push(newArea)
            this._build(true, true)
        } else
            this._hidedAreas.push(newArea)
    }

    public removeArea(component: SplitAreaDirective): void {
        const displayedArea = this.displayedAreas.find(
            (a: Area): boolean => a.component === component,
        )
        const hidedArea = this._hidedAreas.find(
            (a: Area): boolean => a.component === component,
        )
        if (displayedArea) {
            this.displayedAreas.splice(
                this.displayedAreas.indexOf(displayedArea),
                1,
            )
            this._build(true, true)

            return
        }
        if (hidedArea)
            this._hidedAreas.splice(this._hidedAreas.indexOf(hidedArea), 1)
    }

    public updateArea(
        component: SplitAreaDirective,
        resetOrders: boolean,
        resetSizes: boolean,
    ): void {
        if (!component.visible)
            return
        this._build(resetOrders, resetSizes)
    }

    public showArea(component: SplitAreaDirective): void {
        const area = this._hidedAreas.find((a: Area): boolean => a.component
            === component)
        if (!area)
            return

        const areas = this._hidedAreas.splice(this._hidedAreas.indexOf(area), 1)
        this.displayedAreas.push(...areas)

        this._build(true, true)
    }

    public hideArea(comp: SplitAreaDirective): void {
        const area = this.displayedAreas.find((a: Area): boolean =>
            a.component === comp)
        if (!area)
            return

        const areas = this.displayedAreas.splice(
            this.displayedAreas.indexOf(area),
            1,
        )
        areas.forEach((a: Area): void => {
            a.order = 0
            a.size = 0
        })
        this._hidedAreas.push(...areas)

        this._build(true, true)
    }

    public getVisibleAreaSizes(): OutputAreaSizes {
        return this.displayedAreas.map((a: Area): number | '*' => a.size ?? '*')
    }

    public setVisibleAreaSizes(sizes: OutputAreaSizes): boolean {
        if (sizes.length !== this.displayedAreas.length)
            return false

        const formatedSizes = sizes.map((s: number | '*'): number | undefined =>
            getInputPositiveNumber(s, undefined))
        const isValid = isUserSizesValid(this.unit, formatedSizes)
        if (!isValid)
            return false

        this.displayedAreas.forEach((a: Area, i: number): void => {
            a.component.size = formatedSizes[i]
        })

        this._build(false, true)

        return true
    }

    public clickGutter(event: MouseEvent | TouchEvent, gutterNum: number):
        void {
        const tempPoint = getPointFromEvent(event)
        /**
         * Be sure mouseup/touchend happened at same point as
         * mousedown/touchstart to trigger click/dblclick
         */
        if (!this._startPoint || this._startPoint.x !== tempPoint.x
            || this._startPoint.y !== tempPoint.y) {
            this._stopDragging()
            return
        }
        /**
         * If timeout in progress and new click > clearTimeout & dblClickEvent
         */
        if (this._clickTimeout) {
            window.clearTimeout(this._clickTimeout)
            this._clickTimeout = undefined
            this.notify('dblclick', gutterNum)
            this._stopDragging()
        } else
            this._clickTimeout = window.setTimeout(
                (): void => {
                    this._clickTimeout = undefined
                    this.notify('click', gutterNum)
                    this._stopDragging()
                },
                this.gutterDblClickDuration,
            )
    }

    public startDragging(
        event: MouseEvent | TouchEvent,
        gutterOrder: number,
        gutterNum: number,
    ): void {
        event.preventDefault()
        event.stopPropagation()

        this._startPoint = getPointFromEvent(event)
        if (!this._startPoint || this.disabled)
            return
        this._snapshot = {
            allAreasSizePixel: getElementPixelSize(this._el, this.direction)
                - this._getNbGutters() * this.gutterSize,
            allInvolvedAreasSizePercent: 100,
            areasAfterGutter: [],
            areasBeforeGutter: [],
            gutterNum,
            lastSteppedOffset: 0,
        }
        // tslint:disable-next-line: max-func-body-length
        this.displayedAreas.forEach((a: Area): void => {
            const areaSnapshot: AreaSnapshot = {
                area: a,
                /**
                 * If pixel mode, anyway, will not be used.
                 */
                sizePercentAtStart: (this.unit === 'percent') ?
                    (a.size ? a.size : 0) : -1,
                sizePixelAtStart: getElementPixelSize(
                    a.component.elRef,
                    this.direction,
                ),
            }
            if (!this._snapshot)
                /**
                 * Safe to return and no need to throw error for snapshot has
                 * set before.
                 */
                return

            if (a.order < gutterOrder)
                if (this.restrictMove)
                    this._snapshot.areasBeforeGutter = [areaSnapshot]
                else
                    this._snapshot.areasBeforeGutter.unshift(areaSnapshot)
            else if (a.order > gutterOrder)
                if (this.restrictMove) {
                    if (this._snapshot.areasAfterGutter.length === 0)
                        this._snapshot.areasAfterGutter = [areaSnapshot]
                } else
                    this._snapshot.areasAfterGutter.push(areaSnapshot)
        })

        this._snapshot.allInvolvedAreasSizePercent =
            [
                ...this._snapshot.areasBeforeGutter,
                ...this._snapshot.areasAfterGutter,
            ].reduce(
                (t: number, a: AreaSnapshot): number =>
                    t + a.sizePercentAtStart,
                0,
            )

        if (this._snapshot.areasBeforeGutter.length === 0 ||
            this._snapshot.areasAfterGutter.length === 0)
            return

        this._dragListeners.push(this._renderer
            .listen('document', 'mouseup', this._stopDragging.bind(this)))
        this._dragListeners.push(this._renderer
            .listen('document', 'touchend', this._stopDragging.bind(this)))
        this._dragListeners.push(this._renderer
            .listen('document', 'touchcancel', this._stopDragging.bind(this)))

        this._ngZone.runOutsideAngular((): void => {
            this._dragListeners.push(this._renderer
                .listen('document', 'mousemove', this._dragEvent.bind(this)))
            this._dragListeners.push(this._renderer
                .listen('document', 'touchmove', this._dragEvent.bind(this)))
        })

        this.displayedAreas.forEach((a: Area): void => a.component.lockEvents())

        this._isDragging = true
        this._renderer.addClass(this._el.nativeElement, 'as-dragging')
        this._renderer.addClass(
            this._gutterEls
                .toArray()[this._snapshot.gutterNum - 1].nativeElement,
            'as-dragged',
        )

        this.notify('start', this._snapshot.gutterNum)
    }

    public notify(
        type: 'start' | 'progress' | 'end' | 'click' | 'dblclick' | 'transitionEnd',
        gutterNum: number,
    ): void {
        const sizes = this.getVisibleAreaSizes()
        switch (type) {
        case 'start':
            this.dragStart$.next({gutterNum, sizes})
            break
        case 'end':
            this.dragEnd$.next({gutterNum, sizes})
            break
        case 'click':
            this.gutterClick$.next({gutterNum, sizes})
            break
        case 'dblclick':
            this.gutterDblClick$.next({gutterNum, sizes})
            break
        case 'transitionEnd':
            if (this._transitionEndSubscriber)
                this._ngZone.run((): void => this._transitionEndSubscriber
                    .next(sizes))
            break
        case 'progress':
        /**
         * Stay outside zone to allow users do what they want about change
         * detection mechanism.
         */
            this._dragProgressSubject$.next({gutterNum, sizes})
            break
        default:
        }
    }

    public ngOnDestroy(): void {
        this._stopDragging()
    }
    private _direction: Direction = 'horizontal'

    private _unit: 'percent' | 'pixel' = 'percent'

    private _gutterSize = 11

    private _gutterStep = 1

    private _restrictMove = false

    private _useTransition = false

    private _disabled = false

    private _dir: 'ltr' | 'rtl' = 'ltr'

    private _gutterDblClickDuration = 0

    private _transitionEndSubscriber!: Subscriber<OutputAreaSizes>

    private _dragProgressSubject$: Subject<OutputData> = new Subject()

    private _isDragging = false
    // tslint:disable-next-line: readonly-array
    private _dragListeners: Function[] = []
    private _snapshot: SplitSnapshot | undefined
    private _startPoint: Point | undefined
    private _endPoint: Point | undefined
    // tslint:disable-next-line: readonly-array
    private readonly _hidedAreas: Area[] = []

    @ViewChildren('gutter_els') private _gutterEls!: QueryList<ElementRef>

    private _getNbGutters(): number {
        return (this.displayedAreas.length === 0) ? 0 :
            this.displayedAreas.length - 1
    }

    // tslint:disable-next-line: max-func-body-length
    private _build(resetOrders: boolean, resetSizes: boolean): void {
        this._stopDragging()
        if (resetOrders) {
            // If user provided 'order' for each area, use it to sort them.
            if (this.displayedAreas.every((a: Area): boolean =>
                a.component.order !== undefined))
                this.displayedAreas.sort((a: Area, b: Area): number =>
                (a.component.order as number) - (b.component.order as number))

            /**
             * Then set real order with multiples of 2, numbers between will be
             * used by gutters.
             */
            const multi = 2
            this.displayedAreas.forEach((a: Area, i: number): void => {
                a.order = i * multi
                a.component.setStyleOrder(a.order)
            })
        }
        if (resetSizes) {
            const useUserSizes = isUserSizesValid(
                this.unit,
                this.displayedAreas.map((a: Area): number | undefined =>
                    a.component.size),
            )
            switch (this.unit) {
            case 'percent': {
                const percent = 100
                const defaultSize = percent / this.displayedAreas.length
                this.displayedAreas.forEach((a: Area): void => {
                    a.size = useUserSizes ? a.component.size as number
                        : defaultSize
                    a.minSize = getAreaMinSize(a)
                    a.maxSize = getAreaMaxSize(a)
                })
                break
            }
            case 'pixel': {
                if (!useUserSizes) {
                    const wildcardSizeAreas = this.displayedAreas
                        .filter((a: Area): boolean =>
                            a.component.size === undefined)
                    /**
                     * No wildcard area > Need to select one arbitrarily > first
                     */
                    if (wildcardSizeAreas.length === 0 &&
                        this.displayedAreas.length > 0)
                        this.displayedAreas.forEach((
                            a: Area,
                            i: number,
                        ): void => {
                            a.size = (i === 0) ? undefined : a.component.size
                            a.minSize = (i === 0) ? undefined :
                                getAreaMinSize(a)
                            a.maxSize = (i === 0) ? undefined :
                                getAreaMaxSize(a)
                        })
                        /**
                         * More than one wildcard area > Need to keep only one
                         * arbitrarly > first
                         */
                    else if (wildcardSizeAreas.length > 1) {
                        let alreadyGotOne = false
                        // tslint:disable-next-line: max-func-body-length
                        this.displayedAreas.forEach((a: Area): void => {
                            if (!a.component.size) {
                                a.size = a.component.size
                                a.minSize = getAreaMinSize(a)
                                a.maxSize = getAreaMaxSize(a)
                            } else
                                if (!alreadyGotOne) {
                                    a.size = undefined
                                    a.minSize = undefined
                                    a.maxSize = undefined
                                    alreadyGotOne = true
                                } else {
                                    const defaultSize = 100
                                    a.size = defaultSize
                                    a.minSize = undefined
                                    a.maxSize = undefined
                                }
                        })
                    }
                } else
                this.displayedAreas.forEach((a: Area): void => {
                    a.size = a.component.size
                    a.minSize = getAreaMinSize(a)
                    a.maxSize = getAreaMaxSize(a)
                })
                break
            }
            default:
            }
        }

        this._refreshStyleSizes()
        this._cd.markForCheck()
    }

    // tslint:disable-next-line: max-func-body-length
    private _refreshStyleSizes(): void {
        if (this.unit === 'percent')
            // Only one area > flex-basis 100%
            if (this.displayedAreas.length !== 1) {
                const sumGutterSize = this._getNbGutters() * this.gutterSize
                this.displayedAreas.forEach((a: Area): void => {
                    const percent = 100
                    const gutterSize = a.size === 100 ? 0 :
                        a.size as number / percent * sumGutterSize
                    const flexBasic = `calc( ${ a.size }% - ` +
                        `${ gutterSize }px )`
                    a.component.setStyleFlex(
                        0,
                        0,
                        flexBasic,
                        (a.minSize && a.minSize === a.size) ? true : false,
                        (a.maxSize && a.maxSize === a.size) ? true : false,
                    )
                })
            } else
                this.displayedAreas[0].component
                    .setStyleFlex(0, 0, '100%', false, false)
            // Multiple areas > use each percent basis
        else if (this.unit === 'pixel')
            this.displayedAreas.forEach((a: Area): void => {
                // Area with wildcard size
                if (!a.size)
                    if (this.displayedAreas.length === 1)
                        a.component.setStyleFlex(1, 1, '100%', false, false)
                    else
                        a.component.setStyleFlex(1, 1, 'auto', false, false)
                // Area with pixel size
                else
                    // Only one area > flex-basis 100%
                    if (this.displayedAreas.length === 1)
                        a.component.setStyleFlex(0, 0, '100%', false, false)
                    // Multiple areas > use each pixel basis
                    else
                        a.component.setStyleFlex(
                            0,
                            0,
                            `${ a.size }px`,
                            (a.minSize && a.minSize === a.size) ? true : false,
                            (a.maxSize && a.maxSize === a.size) ? true : false,
                        )
            })
    }

// tslint:disable-next-line: cyclomatic-complexity max-func-body-length
    private _dragEvent(event: MouseEvent | TouchEvent): void {
        event.preventDefault()
        event.stopPropagation()

        if (this._clickTimeout) {
            window.clearTimeout(this._clickTimeout)
            this._clickTimeout = undefined
        }

        if (!this._isDragging)
            return

        this._endPoint = getPointFromEvent(event)
        if (!this._snapshot)
            return

        // Calculate steppedOffset
        if (!this._startPoint || !this._endPoint)
            return

        let offset = (this.direction === 'horizontal')
            ? (this._startPoint.x - this._endPoint.x)
            : (this._startPoint.y - this._endPoint.y)
        if (this.dir === 'rtl')
            offset = -offset
        const steppedOffset = Math.round(offset / this.gutterStep) *
            this.gutterStep
        if (steppedOffset === this._snapshot.lastSteppedOffset)
            return

        this._snapshot.lastSteppedOffset = steppedOffset

        // Need to know if each gutter side areas could reacts to steppedOffset

        let areasBefore = getGutterSideAbsorptionCapacity(
            this.unit,
            this._snapshot.areasBeforeGutter,
            -steppedOffset,
            this._snapshot.allAreasSizePixel,
        )
        let areasAfter = getGutterSideAbsorptionCapacity(
            this.unit,
            this._snapshot.areasAfterGutter,
            steppedOffset,
            this._snapshot.allAreasSizePixel,
        )
        // Each gutter side areas can't absorb all offset
        if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
            if (Math.abs(areasBefore.remain) >
                Math.abs(areasAfter.remain))
                areasAfter = getGutterSideAbsorptionCapacity(
                    this.unit,
                    this._snapshot.areasAfterGutter,
                    steppedOffset + areasBefore.remain,
                    this._snapshot.allAreasSizePixel,
                )
            if (Math.abs(areasBefore.remain) <
                Math.abs(areasAfter.remain))
                areasBefore = getGutterSideAbsorptionCapacity(
                    this.unit,
                    this._snapshot.areasBeforeGutter,
                    -(steppedOffset - areasAfter.remain),
                    this._snapshot.allAreasSizePixel,
                )
        } else if (areasBefore.remain !== 0)
            /**
             * Areas before gutter can't absorbs all offset > need to
             * recalculate sizes for areas after gutter.
             */
            areasAfter = getGutterSideAbsorptionCapacity(
                this.unit,
                this._snapshot.areasAfterGutter,
                steppedOffset + areasBefore.remain,
                this._snapshot.allAreasSizePixel,
            )
        /**
         * Areas after gutter can't absorbs all offset > need to recalculate
         * sizes for areas before gutter.
         */
        else if (areasAfter.remain !== 0)
            areasBefore = getGutterSideAbsorptionCapacity(
                this.unit,
                this._snapshot.areasBeforeGutter,
                -(steppedOffset - areasAfter.remain),
                this._snapshot.allAreasSizePixel,
            )

        if (this.unit === 'percent') {
            /**
             * Hack because of browser messing up with sizes using calc(X% -
             * Ypx) -> el.getBoundingClientRect()
             * If not there, playing with gutters makes total going down to
             * 99.99875% then 99.99286%, 99.98986%,..
             */
            const all = [...areasBefore.list, ...areasAfter.list]
            const areaToReset = all.find((a: AreaAbsorptionCapacity): boolean =>
                a.percentAfterAbsorption !== 0
                && a.percentAfterAbsorption !== a.areaSnapshot.area.minSize
                && a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize)
            if (areaToReset)
                areaToReset.percentAfterAbsorption =
                    this._snapshot.allInvolvedAreasSizePercent - all
                        .filter((a: AreaAbsorptionCapacity): boolean =>
                            a !== areaToReset)
                        .reduce(
                            (t: number, a: AreaAbsorptionCapacity): number =>
                                t + a.percentAfterAbsorption,
                            0,
                        )
        }

        /**
         * Now we know areas could absorb steppedOffset, time to really update
         * sizes
         */

        areasBefore.list.forEach((i: AreaAbsorptionCapacity): void =>
            updateAreaSize(this.unit, i))
        areasAfter.list.forEach((i: AreaAbsorptionCapacity): void =>
            updateAreaSize(this.unit, i))

        this._refreshStyleSizes()
        this.notify('progress', this._snapshot.gutterNum)
    }

    // tslint:disable-next-line no-optional-parameter
    private _stopDragging(event?: Event): void {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        if (!this._isDragging)
            return

        this.displayedAreas.forEach((a: Area): void =>
            a.component.unlockEvents())

        // tslint:disable-next-line: no-loop-statement
        while (this._dragListeners.length > 0) {
            const fct = this._dragListeners.pop()
            if (fct) fct()
        }

        /**
         * Warning: Have to be before "notify('end')".
         * Because "notify('end')"" can be linked to "[size]='x'" > "build()" >
         * "stopDragging()".
         */
        this._isDragging = false
        if (!this._startPoint || !this._snapshot)
            return

        this.notify('end', this._snapshot.gutterNum)

        this._renderer.removeClass(this._el.nativeElement, 'as-dragging')
        this._renderer.removeClass(
            this._gutterEls
                .toArray()[this._snapshot.gutterNum - 1].nativeElement,
            'as-dragged',
        )
        this._snapshot = undefined

        /**
         * Needed to let (click)="clickGutter(...)" event run and verify if
         * mouse moved or not
         */
        this._ngZone.runOutsideAngular((): void => {
            setTimeout((): void => {
                this._startPoint = undefined
                this._endPoint = undefined
            })
        })
    }
}
