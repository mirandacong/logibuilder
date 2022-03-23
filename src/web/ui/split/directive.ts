import {
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
} from '@angular/core'

import {SplitComponent} from './component'
import {getInputBoolean, getInputPositiveNumber} from './utils'

@Directive({
    selector: 'logi-split-area, [logi-split-area]',
})
export class SplitAreaDirective implements OnInit, OnDestroy {
    @Input() public set order(v: number | undefined) {
        this._order = getInputPositiveNumber(v, undefined)

        this._split.updateArea(this, true, false)
    }

    public get order(): number | undefined {
        return this._order
    }

    @Input() public set size(v: number | undefined) {
        this._size = getInputPositiveNumber(v, undefined)

        this._split.updateArea(this, false, true)
    }

    public get size(): number | undefined {
        return this._size
    }

    @Input() public set minSize(v: number | undefined) {
        this._minSize = getInputPositiveNumber(v, undefined)

        this._split.updateArea(this, false, true)
    }

    public get minSize(): number | undefined {
        return this._minSize
    }

    @Input() public set maxSize(v: number | undefined) {
        this._maxSize = getInputPositiveNumber(v, undefined)

        this._split.updateArea(this, false, true)
    }

    public get maxSize(): number | undefined {
        return this._maxSize
    }

    @Input() public set lockSize(v: boolean) {
        this._lockSize = getInputBoolean(v)

        this._split.updateArea(this, false, true)
    }

    public get lockSize(): boolean {
        return this._lockSize
    }

    @Input() public set visible(v: boolean) {
        this._visible = getInputBoolean(v)

        if (this._visible) {
            this._split.showArea(this)
            this._renderer.removeClass(this.elRef.nativeElement, 'as-hidden')
        } else {
            this._split.hideArea(this)
            this._renderer.addClass(this.elRef.nativeElement, 'as-hidden')
        }
    }

    public get visible(): boolean {
        return this._visible
    }

    public constructor(
        private readonly _ngZone: NgZone,
        public readonly elRef: ElementRef,
        private readonly _renderer: Renderer2,
        private readonly _split: SplitComponent) {
        this._renderer.addClass(this.elRef.nativeElement, 'as-split-area')
    }

    public ngOnInit(): void {
        this._split.addArea(this)

        this._ngZone.runOutsideAngular((): void => {
            this._transitionListener = this._renderer.listen(
                this.elRef.nativeElement,
                'transitionend',
                (event: TransitionEvent): void => {
                    // Limit only flex-basis transition to trigger the event
                    if (event.propertyName === 'flex-basis')
                        this._split.notify('transitionEnd', -1)
                },
            )
        })
    }

    public setStyleOrder(value: number): void {
        this._renderer.setStyle(this.elRef.nativeElement, 'order', value)
    }

    public lockPointerEvents(): void {
        this._renderer
            .setStyle(this.elRef.nativeElement, 'pointer-events', 'none')
    }

    public freePointerEvents(): void {
        this._renderer
            .setStyle(this.elRef.nativeElement, 'pointer-events', 'unset')
    }

    public setStyleFlex(
        // tslint:disable-next-line: max-params
        grow: number,
        shrink: number,
        basis: string,
        isMin: boolean,
        isMax: boolean,
    ): void {
        /**
         * Need 3 separated properties to work on IE11
         * (https://github.com/angular/flex-layout/issues/323)
         */
        this._renderer.setStyle(this.elRef.nativeElement, 'flex-grow', grow)
        this._renderer.setStyle(this.elRef.nativeElement, 'flex-shrink', shrink)
        this._renderer.setStyle(this.elRef.nativeElement, 'flex-basis', basis)

        if (isMin)
            this._renderer.addClass(this.elRef.nativeElement, 'as-min')
        else
            this._renderer.removeClass(this.elRef.nativeElement, 'as-min')

        if (isMax)
            this._renderer.addClass(this.elRef.nativeElement, 'as-max')
        else
            this._renderer.removeClass(this.elRef.nativeElement, 'as-max')
    }

    public lockEvents(): void {
        this._ngZone.runOutsideAngular(() => {
            this._lockListeners.push(this._renderer
                .listen(this.elRef.nativeElement, 'selectstart', () => true))
            this._lockListeners.push(this._renderer
                .listen(this.elRef.nativeElement, 'dragstart', () => true))
        })
    }

    public unlockEvents(): void {
        while (this._lockListeners.length > 0) {
            const fct = this._lockListeners.pop()
            if (fct) fct()
        }
    }

    public ngOnDestroy(): void {
        this.unlockEvents()

        if (this._transitionListener)
            this._transitionListener()

        this._split.removeArea(this)
    }
    private _order: number | undefined

    private _size: number | undefined

    private _minSize: number | undefined

    private _maxSize: number | undefined

    private _lockSize = false

    private _visible = true

    private _transitionListener!: Function
    // tslint:disable-next-line: readonly-array
    private readonly _lockListeners: Function[] = []
}
