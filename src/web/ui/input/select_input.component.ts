// tslint:disable-next-line: no-single-line-block-comment
/* eslint-disable @typescript-eslint/no-empty-function */
// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: no-empty unknown-instead-of-any
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
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
import {MatAutocomplete} from '@angular/material/autocomplete'
import {assertIsHTMLInputElement} from '@logi/src/web/base/utils'
import {CanDisable, CanDisableCtor, mixinDisabled} from '@logi/src/web/ui/core'
import {LogiInputDirective} from '@logi/src/web/ui/input'
import {merge, Observable, of, Subscription} from 'rxjs'
import {map} from 'rxjs/operators'

// tslint:disable-next-line: no-empty-class
class LogiSelectInputBase {}

// tslint:disable-next-line: naming-convention
const LogiSelectInputMixinBase: CanDisableCtor & typeof LogiSelectInputBase =
    mixinDisabled(LogiSelectInputBase)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueType = any

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {class: 'logi-select-input'},
    // tslint:disable-next-line: no-inputs-metadata-property
    inputs: ['disabled'],
    selector: 'logi-select-input',
    styleUrls: ['./select_input.style.scss'],
    templateUrl: './select_input.template.html',
})
export class LogiSelectInputComponent extends LogiSelectInputMixinBase
    implements ControlValueAccessor, CanDisable, OnInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        @Optional() @Self() private readonly _ngControl: NgControl,
    ) {
        super()
        if (this._ngControl)
            /**
             * Avoid running into a circular import.
             */
            this._ngControl.valueAccessor = this
    }
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_searchSelect: BooleanInput
    public static ngAcceptInputType_dropdownSelect: BooleanInput

    @Input() public options: readonly string[] = []
    @Input() @HostBinding('class.logi-disabled')
    public set disabled(d: boolean) {
        this._disabled = coerceBooleanProperty(d)
    }

    public get disabled(): boolean {
        if (this._ngControl && this._ngControl.disabled !== null)
            return this._ngControl.disabled
        return this._disabled
    }

    @Input() @HostBinding('class.logi-search-select-input')
    public set searchSelect(d: boolean) {
        this._searchSelect = coerceBooleanProperty(d)
    }

    public get searchSelect(): boolean {
        return this._searchSelect
    }

    @Input() @HostBinding('class.logi-dropdown-select-input')
    public set dropdownSelect(d: boolean) {
        this._dropdownSelect = coerceBooleanProperty(d)
    }

    public get dropdownSelect(): boolean {
        return this._dropdownSelect
    }
    @Input() public placeholder = ''
    @Output() public readonly valueChange$ = new EventEmitter<string>()
    @HostBinding('class.logi-focused') public focused = false

    public filteredOptions: Observable<readonly string[]> = of([])

    public ngOnInit(): void {
        const inputValue$ = this._input.input$().pipe(map(event => {
            assertIsHTMLInputElement(event.target)
            return event.target.value
        }))
        const selectValue$ = this._auto.optionSelected.pipe(map(event =>
            event.option.value))
        this.filteredOptions = inputValue$
            .pipe(map(value => this._filter(value)))
        const valueChange$ = merge(inputValue$, selectValue$)
        this._subs.add(valueChange$.subscribe(value => {
            this.valueChange$.next(value)
            this._onChange(value)
        }))
        this._subs.add(this._input.isFocused$().subscribe(focused => {
            this.focused = focused
            this._cd.markForCheck()
        }))
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    @HostBinding('blur') public onBlur(): void {
        if (!this.disabled) {
            this._onTouched()
            this._cd.markForCheck()
        }
    }

    public getSearchIcon(): string {
        const value = this._input.getValue()
        return String(value).length !== 0 ? 'ic_close' : 'ic_search'
    }

    public onClickArrow(event: Event): void {
        if (this.disabled)
            return
        event.stopPropagation()
        this._input.focus()
    }

    public onClearInput(): void {
        if (this.disabled)
            return
        this.writeValue('')
    }

    public registerOnChange(fn: (value: ValueType) => void): void {
        this._onChange = fn
    }

    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn
    }

    public writeValue(value: ValueType): void {
        if (this.disabled)
            return
        this._input.setValue(value)
    }

    private _subs = new Subscription()
    private _disabled = false
    private _dropdownSelect = false
    private _searchSelect = false
    @ViewChild('trigger', {static: true, read: LogiInputDirective})
    private readonly _input!: LogiInputDirective
    @ViewChild('auto', {static: true}) private readonly _auto!: MatAutocomplete
    private _onChange: (value: ValueType) => void = () => {}
    private _onTouched = (): void => {}

    private _filter(value: string): readonly string[] {
        return this.options.filter(option =>
            option.toLowerCase().includes(value.toLowerCase()))
    }
}
