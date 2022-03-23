// tslint:disable: no-null-keyword
// tslint:disable: variable-name naming-convention
// tslint:disable: no-inputs-metadata-property
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: parameter-properties unknown-instead-of-any
// tslint:disable: no-host-metadata-property
// tslint:disable: no-single-line-block-comment
// tslint:disable: no-forward-ref
import {coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    AfterContentInit,
    ChangeDetectorRef,
    ContentChildren,
    Directive,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    QueryList,
} from '@angular/core'
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms'

import {LogiRadioButtonComponent} from './component'

let nextUniqueId = 0
export const LOGI_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
    multi: true,
    provide: NG_VALUE_ACCESSOR,
    // tslint:disable-next-line: no-forward-ref
    useExisting: forwardRef(() => LogiRadioGroupDirective),
}

/**
 * Change event object emitted by LogiRadio and LogiRadioGroup.
 */
export class LogiRadioChange {
    public constructor(
        /** The MatRadioButton that emits the change event. */
        public source: LogiRadioButtonComponent,
        /** The value of the MatRadioButton. */
        public value: any) {}
}

@Directive({
    providers: [LOGI_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
    // tslint:disable-next-line: directive-selector
    selector: 'logi-radio-group',
})
export class LogiRadioGroupDirective implements AfterContentInit,
ControlValueAccessor {
    @Input()
    public get labelPosition(): 'before' | 'after' {
        return this._labelPosition
    }

    public set labelPosition(v) {
        this._labelPosition = v === 'before' ? 'before' : 'after'
    }

    /**
     * Value for the radio-group. Should equal the value of the selected radio
     * button if there is a corresponding radio button with a matching value.
     * If there is not such a corresponding radio button, this value persists
     * to be applied in case a new radio button is added with a matching value.
     */
    @Input()
    public get value(): any {
        return this._value
    }

    public set value(newValue: any) {
        if (this._value !== newValue) {
            /**
             * Set this before proceeding to ensure no circular loop occurs with
             * selection.
             */
            this._value = newValue
            this._updateSelectedRadioFromValue()
            this._checkSelectedRadioButton()
        }
    }

    /**
     * The currently selected radio button. If set to a new radio button,
     * the radio group value will be updated to match the new selected
     * button.
     */
    @Input()
    public get selected(): LogiRadioButtonComponent | null {
        return this._selected
    }

    public set selected(selected: LogiRadioButtonComponent | null) {
        this._selected = selected
        this.value = selected ? selected.value : null
        this._checkSelectedRadioButton()
    }

    @Input()
    public get name(): string {
        return this._name
    }

    public set name(value: string) {
        this._name = value
        this._updateRadioButtonNames()
    }

    @Input()
    public get disabled(): boolean {
        return this._disabled
    }

    public set disabled(value) {
        this._disabled = coerceBooleanProperty(value)
        this._markRadiosForCheck()
    }

    public constructor(private readonly _cd: ChangeDetectorRef) {}
    @Output() public readonly change$ = new EventEmitter<LogiRadioChange>()
    @Output() public readonly valueChange$ = new EventEmitter<any>()

    /**
     * Write new value from MODEL into VIEW or DOM.
     */
    public writeValue(value: any): void {
        this.value = value
        this._cd.markForCheck()
    }

    public registerOnChange(fn: (value: any) => void): void {
        this.controlValueAccessorChangeFn = fn
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }

    /**
     * Implemented as part of ControlValueAccessor.
     * Set disabled state for the form control.
     */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled
        this._cd.markForCheck()
    }

    public ngAfterContentInit(): void {
        this._isInitialized = true
    }

    public touch(): void {
        if (this.onTouched)
            this.onTouched()
    }
    // tslint:disable-next-line: no-empty
    public onTouched = (): void => {}

    /** The method to be called in order to update ngModel */
    // tslint:disable-next-line: no-empty ext-variable-name
    public controlValueAccessorChangeFn: (_: any) => void = () => {}
    public emitChangeEvent(): void {
        if (!this._isInitialized)
            return
        // tslint:disable-next-line: no-non-null-assertion
        this.change$.next(new LogiRadioChange(this._selected!, this._value))
        this.valueChange$.next(this._value)
    }

    @ContentChildren(forwardRef(() => LogiRadioButtonComponent), {
        descendants: true,
    }) private _radios!: QueryList<LogiRadioButtonComponent>
    /** Whether the `value` has been set to its initial value. */
    private _isInitialized = false
    private _disabled = false
    /** Selected value for the radio group. */
    private _value: any = null

    /** The currently selected radio button. Should match value. */
    private _selected: LogiRadioButtonComponent | null = null

    private _labelPosition: 'before' | 'after' = 'after'
    // tslint:disable-next-line: increment-decrement
    private _name = `mat-radio-group-${nextUniqueId++}`

    private _markRadiosForCheck(): void {
        if (this._radios)
            this._radios.forEach(radio => radio.markForCheck())
    }

    private _updateRadioButtonNames(): void {
        if (this._radios)
            this._radios.forEach(radio => {
                radio.name = this.name
                radio.markForCheck()
            })
    }

    private _checkSelectedRadioButton(): void {
        if (this._selected && !this._selected.checked)
            this._selected.checked = true
    }

    /**
     * Updates the `selected` radio button from the internal _value state.
     */
    private _updateSelectedRadioFromValue(): void {
        // If the value already matches the selected radio, do nothing.
        const isAlreadySelected = this._selected !== null
            && this._selected.value === this._value
        // tslint:disable-next-line: early-exit
        if (this._radios && !isAlreadySelected) {
            this._selected = null
            this._radios.forEach(radio => {
                radio.checked = this.value === radio.value
                if (radio.checked)
                    this._selected = radio
            })
        }
    }
}
