// tslint:disable: no-null-keyword variable-name naming-convention
// tslint:disable: no-inputs-metadata-property ng-no-get-and-set-property
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: parameter-properties unknown-instead-of-any
// tslint:disable: no-host-metadata-property no-single-line-block-comment
// tslint:disable: no-empty ext-variable-name no-forward-ref
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms'
import {MatRipple} from '@angular/material/core'
import {
    CanDisable,
    CanDisableCtor,
    CanDisableRipple,
    CanDisableRippleCtor,
    mixinDisabled,
    mixinDisableRipple,
} from '@logi/src/web/ui/core'

export const enum TransitionCheckState {
    // The initial state of the component before any user interaction.
    Init,
    // The state representing the component when it's becoming checked.
    Checked,
    // The state representing the component when it's becoming unchecked.
    Unchecked,
    // The state representing the component when it's becoming indeterminate.
    Indeterminate,
}

class LogiCheckboxBase {
    public constructor(public _el: ElementRef) {}
}
const LogiCheckboxMixinBase:
    CanDisableRippleCtor &
    CanDisableCtor &
    typeof LogiCheckboxBase =
        mixinDisabled(mixinDisableRipple(LogiCheckboxBase))

export class LogiCheckboxChange {
    public checked!: boolean
    public source!: LogiCheckboxComponent
}

export type MatCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined

/**
 * Injection token that can be used to specify the checkbox click behavior.
 */
export const MAT_CHECKBOX_CLICK_ACTION =
    new InjectionToken<MatCheckboxClickAction>('mat-checkbox-click-action')

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.logi-checkbox-checked]': 'checked',
        '[class.logi-checkbox-disabled]': 'disabled',
        '[class.logi-checkbox-indeterminate]': 'indeterminate',
        '[class.logi-checkbox-label-before]': 'labelPosition == "before"',
        class: 'logi-checkbox',
    },
    inputs: ['disableRipple', 'disabled'],
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            // tslint:disable-next-line: no-forward-ref
            useExisting: forwardRef(() => LogiCheckboxComponent),
        },
    ],
    selector: 'logi-checkbox',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiCheckboxComponent extends LogiCheckboxMixinBase implements
ControlValueAccessor, CanDisable, CanDisableRipple, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        @Optional() @Inject(MAT_CHECKBOX_CLICK_ACTION)
        private readonly _clickAction: MatCheckboxClickAction,
        public readonly _el: ElementRef,
        private readonly _ngZone: NgZone,
    ) {
        super(_el)
    }
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_checked: BooleanInput
    public static ngAcceptInputType_indeterminate: BooleanInput

    @Input() public get disabled(): boolean {
        return this._disabled
    }

    public set disabled(value) {
        const newValue = coerceBooleanProperty(value)
        if (newValue !== this._disabled) {
            this._disabled = newValue
            this._cd.markForCheck()
        }
    }

    @Input() public get checked(): boolean {
        return this._checked
    }

    public set checked(value: boolean) {
        if (value !== this._checked) {
            this._checked = value
            this._cd.markForCheck()
        }
    }

    @Input() public get indeterminate(): boolean {
        return this._indeterminate
    }

    public set indeterminate(value: boolean) {
        const changed = value !== this._indeterminate
        this._indeterminate = value

        if (!changed)
            return
        if (this._indeterminate)
            this._transitionCheckState(TransitionCheckState.Indeterminate)
        else
            this._transitionCheckState(
                this.checked ? TransitionCheckState.Checked :
                    TransitionCheckState.Unchecked,
            )
        this.indeterminateChange$.next(this._indeterminate)
    }

    // The value attribute of the native input element.
    @Input() public value = ''
    @Input() public labelPosition: 'before' | 'after' = 'after'
    @Input() public name: string | null = null

    // Event emitted when the checkbox's `checked` value changes.
    @Output() public readonly change$ = new EventEmitter<LogiCheckboxChange>()
    @Output() public readonly valueChange$ = new EventEmitter<boolean>()

    // Event emitted when the checkbox's `indeterminate` value changes.
    @Output() public readonly indeterminateChange$ = new EventEmitter<boolean>()
    @ViewChild(MatRipple, {static: false}) public ripple!: MatRipple
    @ViewChild('input', {static: false})
    public _inputEl!: ElementRef<HTMLInputElement>
    public onTouched = (): void => {}

    public controlValueAccessorChangeFn: (_: any) => void = () => {}
    public registerOnChange(fn: (value: any) => void): void {
        this.controlValueAccessorChangeFn = fn
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }

    public writeValue(value: any): void {
        // tslint:disable-next-line: no-double-negation
        this.checked = !!value
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled
        this._cd.markForCheck()
    }

    public isRippleDisabled(): boolean {
        return this.disableRipple || this.disabled
    }

    // tslint:disable-next-line: prefer-function-over-method
    public onChange(event: Event): void {
        event.stopPropagation()
    }

    public onInputClick(event: Event): void {
        event.stopPropagation()
        if (!this.disabled && this._clickAction !== 'noop') {
            if (this.indeterminate && this._clickAction !== 'check')
                Promise.resolve().then(() => {
                    this._indeterminate = false
                    this.indeterminateChange$.next(this._indeterminate)
                })
            this._toggle()
            this._transitionCheckState(this._checked ? TransitionCheckState
                .Checked : TransitionCheckState.Unchecked)
            this._emitChangeEvent()
        } else if (!this.disabled && this._clickAction === 'noop') {
            // tslint:disable: ng-rvalue-only-native-element
            this._inputEl.nativeElement.checked = this.checked
            this._inputEl.nativeElement.indeterminate = this.indeterminate
        }
    }

    // tslint:disable-next-line: prefer-function-over-method
    public ngOnDestroy(): void {
    }

    private _indeterminate = false
    private _disabled = false
    private _checked = false
    private _currentAnimationClass = ''
    private _currentCheckState: TransitionCheckState = TransitionCheckState.Init
    private _toggle(): void {
        this.checked = !this.checked
    }

    private _emitChangeEvent(): void {
        const event = new LogiCheckboxChange()
        event.source = this
        event.checked = this.checked

        this.controlValueAccessorChangeFn(this.checked)
        this.change$.next(event)
        this.valueChange$.next(this.checked)
    }

    private _transitionCheckState(newState: TransitionCheckState): void {
        const oldState = this._currentCheckState
        const element: HTMLElement = this._el.nativeElement

        if (oldState === newState)
            return
        if (this._currentAnimationClass.length > 0)
            element.classList.remove(this._currentAnimationClass)

        this._currentAnimationClass = this
            ._getAnimationClassForCheckStateTransition(oldState, newState)
        this._currentCheckState = newState

        if (this._currentAnimationClass.length < 0
            || this._currentAnimationClass.trim() === '')
            return
        element.classList.add(this._currentAnimationClass)

        const animationClass = this._currentAnimationClass

        this._ngZone.runOutsideAngular(() => {
            // tslint:disable-next-line: no-scheduling-timers
            setTimeout(
                () => {
                    element.classList.remove(animationClass)
                },
                // tslint:disable-next-line: no-magic-numbers
                1000,
            )
        })
    }

    // tslint:disable-next-line: prefer-function-over-method
    private _getAnimationClassForCheckStateTransition(
        oldState: TransitionCheckState,
        newState: TransitionCheckState,
    ): string {
        let animSuffix = ''

        switch (oldState) {
        case TransitionCheckState.Init:
            if (newState === TransitionCheckState.Checked)
                animSuffix = 'unchecked-checked'
            else if (newState === TransitionCheckState.Indeterminate)
                animSuffix = 'unchecked-indeterminate'
            else
                return ''
            break
        case TransitionCheckState.Unchecked:
            animSuffix = newState === TransitionCheckState.Checked ?
                'unchecked-checked' : 'unchecked-indeterminate'
            break
        case TransitionCheckState.Checked:
            animSuffix = newState === TransitionCheckState.Unchecked ?
                'checked-unchecked' : 'checked-indeterminate'
            break
        case TransitionCheckState.Indeterminate:
            animSuffix = newState === TransitionCheckState.Checked ?
                'indeterminate-checked' : 'indeterminate-unchecked'
            break
        default:
        }

        return `mat-checkbox-anim-${animSuffix}`
    }
}
