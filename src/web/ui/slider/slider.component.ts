import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {DOCUMENT} from '@angular/common'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Self,
    SimpleChanges,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core'
import {ControlValueAccessor, NgControl} from '@angular/forms'
import {getElementOffset, silentEvent} from '@logi/src/web/base/utils'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {fromEvent, Observable, Subscription} from 'rxjs'
import {map, pluck, takeUntil, tap} from 'rxjs/operators'

import {LogiSliderHandleComponent} from './handle.component'
import {LogiSliderService} from './service'
import {
    assertValueValid,
    ensureNumberInRange,
    generateHandlers,
    getClosestIndexofRange,
    getLogicalValue,
    getPercent,
    getPrecision,
    isRangeValue,
    isValueEqual,
} from './slider_value'
import {SliderHandler, SliderValue} from './typing'

// tslint:disable: no-null-keyword
// tslint:disable: codelyzer-template-property-should-be-public
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.logi-disabled]': 'disabled',
        class: 'logi-slider',
    },
    providers: [LogiSliderService],
    selector: 'logi-slider',
    styleUrls: ['./slider.style.scss'],
    templateUrl: './slider.template.html',
})
export class LogiSliderComponent implements ControlValueAccessor, OnInit,
OnChanges, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        @Inject(DOCUMENT) private readonly _doc: Document,
        private readonly _logiSliderSvc: LogiSliderService,
        @Optional() @Self() private readonly _ngControl: NgControl,
    ) {
        if (this._ngControl)
            this._ngControl.valueAccessor = this
    }

    // tslint:disable-next-line: ext-variable-name variable-name
    public static ngAcceptInputType_range: BooleanInput

    @Input() public set value(value: SliderValue) {
        this._value = value
        this._updateTrackAndHandles()
    }

    public get value(): SliderValue {
        return this._value
    }

    @Input() public set disabled(disabled: boolean) {
        this._disabled = coerceBooleanProperty(disabled)
        this._toggleDisabled()
    }

    public get disabled(): boolean {
        if (this._ngControl && this._ngControl.disabled !== null)
            return this._ngControl.disabled
        return this._disabled
    }
    @Input() public vertical = false
    @Input() public reverse = false
    @Input() public max = 100
    @Input() public min = 0
    @Input() public step = 1
    @Input() public included = true
    @Input() @InputBoolean() public range = false
    @Input() public dots = false
    @Input() public tooltipFormatter?: (value: number) => string
    @Output() public readonly valueChange$ = new EventEmitter<SliderValue>()
    public handles: readonly SliderHandler[] = []
    public track: { offset: null | number; length: null | number } =
        {offset: null, length: null}
    public steps: ReadonlyArray<unknown> = []

    public ngOnInit(): void {
        // tslint:disable-next-line: no-magic-numbers
        this.handles = generateHandlers(this.range ? 2 : 1)
        this._initDragEventListener()
        this._toggleDisabled()
        this._updateTrackAndHandles()

        const element = this._sliderRef.nativeElement
        this._subs.add(fromEvent(element, 'blur').subscribe(() => {
            if (this.disabled)
                return
            this._onTouched()
        }))
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const range = changes.range
        if (range && !range.firstChange)
            this._setValue(this._formatValue())
    }

    public ngOnDestroy(): void {
        this._unsubscribeDragEvent()
        this._subs.unsubscribe()
    }

    public registerOnChange(fn: (value: SliderValue) => void): void {
        this._onChange = fn
    }

    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn
    }

    public writeValue(value: SliderValue): void {
        if (this._disabled)
            return
        this._value = this._formatValue(value)
        this._updateTrackAndHandles()
    }

    public isDragging(): boolean {
        return this._logiSliderSvc.isDragging()
    }

    @ViewChild('slider', {static: true})
    private readonly _sliderRef!: ElementRef<HTMLElement>
    @ViewChildren(LogiSliderHandleComponent)
    private readonly _handles!: QueryList<LogiSliderHandleComponent>
    private _value: SliderValue = 0
    private _disabled = false
    private _dragStart$?: Observable<number>
    private _dragMove$?: Observable<number>
    private _dragEnd$?: Observable<Event>
    private _dragStartSub: Subscription | null = null
    private _dragMoveSub: Subscription | null = null
    private _dragEndSub: Subscription | null = null
    private _subs: Subscription = new Subscription()
    private _cacheSliderStart: number | null = null
    private _cacheSliderLength: number | null = null
    private _activeHandleIndex = 0
    private _bounds: {lower: SliderValue | null; upper: SliderValue | null} =
        {lower: null, upper: null}
    // tslint:disable: no-empty
    private _onChange: (value: SliderValue) => void = () => {}
    private _onTouched: () => void = () => {}

    private _initDragEventListener(): void {
        const element = this._sliderRef.nativeElement
        const pluckKey = this.vertical ? 'pageY' : 'pageX'

        this._dragStart$ = fromEvent(element, 'mousedown').pipe(
            tap(silentEvent),
            pluck<Event, number>(pluckKey),
            map(value => this._findClosestValue(value)),
        )
        this._dragEnd$ = fromEvent(this._doc, 'mouseup')
        this._dragMove$ = fromEvent(this._doc, 'mousemove').pipe(
            takeUntil(this._dragEnd$),
            tap(silentEvent),
            pluck<Event, number>(pluckKey),
            map(value => this._findClosestValue(value)),
        )
    }

    private _toggleDisabled(): void {
        if (this.disabled) {
            this._unsubscribeDragEvent()
            return
        }
        this._onDragStart()
    }

    private _onDragStart(): void {
        if (!this._dragStart$ || this._dragStartSub)
            return
        this._dragStartSub = this._dragStart$.subscribe(value => {
            this._logiSliderSvc.startDragging()
            this._onDragMove()
            this._onDragEnd()
            this._cacheSliderProperty()
            const logicalValue = getLogicalValue(value, this.max, this.reverse)
            this._setActiveHandleIndex(logicalValue)
            this._setActiveValue(logicalValue)
        })
    }

    private _onDragMove(): void {
        if (!this._dragMove$ || this._dragMoveSub)
            return
        this._dragMoveSub = this._dragMove$.subscribe(value => {
            const logicalValue = getLogicalValue(value, this.max, this.reverse)
            this._setActiveValue(logicalValue)
            this._cd.markForCheck()
        })
    }

    private _onDragEnd(): void {
        if (!this._dragEnd$ || this._dragEndSub)
            return
        this._dragEndSub = this._dragEnd$.subscribe(() => {
            this._logiSliderSvc.stopDragging()
            this._dragMoveSub?.unsubscribe()
            this._dragMoveSub = null
            this._dragEndSub?.unsubscribe()
            this._dragEndSub = null
            this._cacheSliderProperty(true)
            this._cd.markForCheck()
        })
    }

    private _unsubscribeDragEvent(): void {
        this._dragStartSub?.unsubscribe()
        this._dragMoveSub?.unsubscribe()
        this._dragEndSub?.unsubscribe()
        this._dragStartSub = null
        this._dragMoveSub = null
        this._dragEndSub = null
    }

    private _cacheSliderProperty(remove = false): void {
        this._cacheSliderStart = remove ? null : this._getSliderStartPosition()
        this._cacheSliderLength = remove ? null : this._getSliderLength()
    }

    private _getSliderStartPosition(): number {
        if (this._cacheSliderStart !== null)
            return this._cacheSliderStart
        const offset = getElementOffset(this._sliderRef.nativeElement)
        return this.vertical ? offset.top : offset.left
    }

    private _getSliderLength(): number {
        if (this._cacheSliderLength !== null)
            return this._cacheSliderLength
        const element = this._sliderRef.nativeElement
        return this.vertical ? element.clientHeight : element.clientWidth
    }

    private _setActiveHandleIndex(pointerValue: number): void {
        const value = this._getValue()
        const handles = this._handles.toArray()
        if (!isRangeValue(value)) {
            handles[0].focus()
            return
        }
        this._activeHandleIndex = getClosestIndexofRange(pointerValue, value)
        handles[this._activeHandleIndex].focus()
    }

    private _setActiveValue(pointerValue: number): void {
        if (isRangeValue(this.value)) {
            const newValue = [...this.value]
            newValue[this._activeHandleIndex] = pointerValue
            this._setValue(newValue)
            return
        }
        this._setValue(pointerValue)
    }

    private _getValue(cloneAndSort = false): SliderValue {
        if (cloneAndSort && this.value && isRangeValue(this.value))
            return [...this.value].sort((a, b) => a - b)
        return this.value
    }

    private _setValue(value: SliderValue, isWriteValue = false): void {
        if (isWriteValue) {
            this._value = this._formatValue(value)
            this._updateTrackAndHandles()
            return
        }
        if (value === null)
            return
        if (isValueEqual(this.value, value))
            return
        this._value = value
        this._updateTrackAndHandles()
        const emitValue = this._getValue(true)
        this.valueChange$.emit(emitValue)
        this._onChange(emitValue)
    }

    private _updateTrackAndHandles(): void {
        const value = this._getValue()
        const offset = this._getValueToOffset(value)
        const valueSorted = this._getValue(true)
        const offsetSorted = this._getValueToOffset(valueSorted)
        const boundParts = isRangeValue(valueSorted) ?
            valueSorted : [0, valueSorted]
        const trackParts = isRangeValue(offsetSorted) ?
            [offsetSorted[0], offsetSorted[1] - offsetSorted[0]] :
            [0, offsetSorted]

        this.handles.forEach((handle, index) => {
            handle.offset = isRangeValue(offset) ? offset[index] : offset
            handle.value = isRangeValue(value) ? value[index] : value || 0
        });

        [this._bounds.lower, this._bounds.upper] = boundParts;
        [this.track.offset, this.track.length] = trackParts

        this._cd.markForCheck()
    }

    private _getValueToOffset(value?: SliderValue): SliderValue {
        let normalizedValue = value

        // tslint:disable-next-line: no-typeof-undefined
        if (typeof normalizedValue === 'undefined')
            normalizedValue = this._getValue(true)

        return isRangeValue(normalizedValue) ?
            normalizedValue.map(val => this._valueToOffset(val)) :
            this._valueToOffset(normalizedValue)
    }

    private _valueToOffset(value: number): number {
        return getPercent(this.min, this.max, value)
    }

    private _findClosestValue(position: number): number {
        const sliderStart = this._getSliderStartPosition()
        const sliderLength = this._getSliderLength()
        const ratio = ensureNumberInRange(
            (position - sliderStart) / sliderLength,
            0,
            1,
        )
        const val = (this.max - this.min)
            * (this.vertical ? 1 - ratio : ratio) + this.min
        const points = []
        if (this.step !== 0 && !this.dots) {
            const closestOne = Math.round(val / this.step) * this.step
            points.push(closestOne)
        }
        const gaps = points.map(point => Math.abs(val - point))
        const closest = points[gaps.indexOf(Math.min(...gaps))]

        // tslint:disable-next-line: ban
        return this.step === null ? closest : parseFloat(
            closest.toFixed(getPrecision(this.step)),
        )
    }

    private _formatValue(value?: SliderValue): SliderValue {
        if (!value)
            return this.range ? [this.min, this.max] : this.min
        if (assertValueValid(value, this.range))
            return isRangeValue(value) ? value.map(val =>
                ensureNumberInRange(val, this.min, this.max))
            : ensureNumberInRange(value, this.min, this.max)
        return this.value ?? this.range ? [this.min, this.max] : this.min
    }
}
