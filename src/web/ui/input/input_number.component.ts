// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: no-empty unknown-instead-of-any
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Self,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {ControlValueAccessor, NgControl} from '@angular/forms'
import {add, bignumber, divide, multiply, subtract} from 'mathjs'
import {fromEvent, merge, Observable, Subscription} from 'rxjs'
import {map} from 'rxjs/operators'

export type OperationType = 'add' | 'multiply'

export type InputNumberSize = 'large' | 'default' | 'small'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.logi-input-number-large]': 'size === "large"',
        '[class.logi-input-number-small]': 'size === "small"',
    },
    selector: 'logi-input-number',
    styleUrls: ['./input_number.style.scss'],
    templateUrl: './input_number.template.html',
})
export class LogiInputNumberComponent implements ControlValueAccessor, OnInit,
OnDestroy {
    public constructor(
        @Self() @Optional() private readonly _ngControl: NgControl,
    ) {
        if (this._ngControl)
            this._ngControl.valueAccessor = this
    }
    public static ngAcceptInputType_disabled: BooleanInput

    @Input() public min = Number.MIN_SAFE_INTEGER
    @Input() public max = Number.MAX_SAFE_INTEGER
    @Input() public step = 1
    @Input() operationType: OperationType = 'add'
    @Input() size: InputNumberSize = 'default'
    @Input() public set value(value: number) {
        this._setValidValue(value, false)
    }

    public get value(): number {
        return this._value
    }

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        if (this._ngControl && this._ngControl.disabled !== null)
            return this._ngControl.disabled
        return this._disabled
    }

    @Output() public readonly valueChange$ = new EventEmitter<number>()

    public focus$!: Observable<boolean>
    leftIcon = 'ic_remove'
    rightIcon = 'ic_add'

    get isAddType(): boolean {
        return this.operationType === 'add'
    }

    public get isMinValue(): boolean {
        return this._value <= this.min
    }

    public get isMaxValue(): boolean {
        return this._value >= this.max
    }

    public ngOnInit(): void {
        if (!this.isAddType) {
            this.leftIcon = 'ic_arrow_left'
            this.rightIcon = 'ic_arrow_right'
        }
        const el = this._inputRef.nativeElement
        this.focus$ = merge(fromEvent(el, 'focus'), fromEvent(el, 'blur'))
            .pipe(map(e => e.type === 'focus'))
        this._onInputValueChange()
        /**
         * current this._value may be not included in [min, max]
         */
        this._setValidValue(this._value)
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    public registerOnChange(fn: (value: number) => void): void {
        this._onChange = fn
    }

    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn
    }

    public writeValue(value: any): void {
        this._setValidValue(value, false)
    }

    public onAdd(): void {
        /**
         * Use mathjs to solve problem about 0.1 + 0.2 !== 0.3.
         */
        const value = this.isAddType ?
            add(bignumber(this._value), bignumber(this.step)) :
            multiply(bignumber(this._value), bignumber(this.step))
        this._setValidValue(Number(value))
        this.valueChange$.emit(Number(value))
    }

    public onSubtract(): void {
        const value = this.isAddType ?
            subtract(bignumber(this._value), bignumber(this.step)) :
            divide(bignumber(this._value), bignumber(this.step))
        this._setValidValue(Number(value))
        this.valueChange$.emit(Number(value))
    }

    @ViewChild('input', {static: true})
    private readonly _inputRef!: ElementRef<HTMLInputElement>
    private _subs = new Subscription()
    private _value = 0
    private _disabled = false
    private _onChange: (value: number) => void = () => {}
    private _onTouched: () => void = () => {}

    private _onInputValueChange(): void {
        const el = this._inputRef.nativeElement
        this._subs.add(fromEvent(el, 'blur').subscribe(() => {
            this._onTouched()
            const value = this._getValidValue(el.value)
            if (value === null) {
                el.value = String(this._value)
                return
            }
            this._setValidValue(value)
            this.valueChange$.emit(value)
        }))
    }

    private _setValidValue(value: number, emit = true): void {
        const newValue = this._getValidValue(String(value))
        if (newValue === null)
            return
        this._value = newValue
        this._inputRef.nativeElement.value = String(newValue)
        if (!emit)
            return
        this._onChange(newValue)
    }

    private _getValidValue(valueStr: string): number | null {
        const value = Number(valueStr)
        if (isNaN(value))
            return null
        if (value <= this.min)
            return this.min
        if (value >= this.max)
            return this.max
        return value
    }
}
