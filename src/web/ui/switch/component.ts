// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: parameter-properties unknown-instead-of-any
import {FocusMonitor} from '@angular/cdk/a11y'
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core'
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms'
import {
    CanDisable,
    CanDisableCtor,
    CanDisableRipple,
    CanDisableRippleCtor,
    mixinDisabled,
    mixinDisableRipple,
} from '@logi/src/web/ui/core'

class LogiSwitchBase {
    // tslint:disable-next-line: naming-convention
    public constructor(public _el: ElementRef) {}
}
// tslint:disable-next-line: variable-name naming-convention
const LogiSwitchMixinBase:
    CanDisableRippleCtor &
    CanDisableCtor &
    typeof LogiSwitchBase =
        mixinDisableRipple(mixinDisabled(LogiSwitchBase))

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[class.logi-checked]': 'checked',
        '[class.logi-disabled]': 'disabled',
        '[class.logi-switch-label-before]': 'labelPosition == "before"',
        class: 'logi-switch',
    },
    // tslint:disable-next-line: no-inputs-metadata-property
    inputs: ['disableRipple', 'disabled'],
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            // tslint:disable-next-line: no-forward-ref
            useExisting: forwardRef(() => LogiSwitchComponent),
        },
    ],
    selector: 'logi-switch',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiSwitchComponent extends LogiSwitchMixinBase
implements CanDisable, CanDisableRipple, ControlValueAccessor,
AfterContentInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _focusMonitor: FocusMonitor,
        // tslint:disable-next-line: ng-property-naming-convention
        public el: ElementRef,
    ) {
        super(el)
    }

    // tslint:disable: ext-variable-name variable-name
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_checked: BooleanInput

    @Input() public get checked(): boolean {
        return this._checked
    }

    public set checked(value: boolean) {
        this._checked = coerceBooleanProperty(value)
        this._cd.markForCheck()
    }

    @Output() public readonly change$ = new EventEmitter<boolean>()

    public ngAfterContentInit(): void {
        this._focusMonitor.monitor(this._el, true).subscribe(focusOrigin => {
            if (!focusOrigin)
                Promise.resolve().then(() => this._onTouched())
        })
    }

    public ngOnDestroy(): void {
        this._focusMonitor.stopMonitoring(this._el)
    }

    public onChangeEvent(event: Event): void {
        /**
         * We always have to stop propagation on the change event.
         * Otherwise the change event, from the input element, will bubble up
         * and emit its event object to the component's `change` output.
         */
        event.stopPropagation()

        this.checked = this._inputEl.nativeElement.checked
        this.change$.next(this.checked)
        this._emitChangeEvent()
    }

    // tslint:disable-next-line: prefer-function-over-method
    public onInputClick(event: Event): void {
        event.stopPropagation()
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    public registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn
    }

    public writeValue(value: any): void {
        // tslint:disable-next-line: no-double-negation
        this.checked = !!value
    }

    /**
     * Implemented as part of ControlValueAccessor.
     */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled
        this._cd.markForCheck()
    }

    @ViewChild('input', {static: false})
    private readonly _inputEl!: ElementRef<HTMLInputElement>
    private _checked = false
    // tslint:disable-next-line: ext-variable-name naming-convention no-empty
    private _onChange = (_: any): void => {}
    // tslint:disable-next-line: no-empty
    private _onTouched = (): void => {}
    /**
     * Emits a change event on the `change` output. Also notifies the
     * FormControl about the change.
     */
    private _emitChangeEvent(): void {
        this._onChange(this.checked)
    }
}
