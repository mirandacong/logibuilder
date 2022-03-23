// tslint:disable: no-null-keyword
// tslint:disable: ng-no-get-and-set-property
// tslint:disable: variable-name naming-convention
// tslint:disable: no-inputs-metadata-property
// tslint:disable: codelyzer-template-property-should-be-public
// tslint:disable: parameter-properties unknown-instead-of-any
// tslint:disable: no-host-metadata-property
// tslint:disable: no-single-line-block-comment
// tslint:disable: no-forward-ref
import {FocusMonitor} from '@angular/cdk/a11y'
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {UniqueSelectionDispatcher} from '@angular/cdk/collections'
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewEncapsulation,
} from '@angular/core'
import {
    CanDisableRipple,
    CanDisableRippleCtor,
    mixinDisableRipple,
} from '@logi/src/web/ui/core'

import {LogiRadioChange, LogiRadioGroupDirective} from './radio-group.directive'

let nextUniqueId = 0

class LogiRadioButtonBase {
    public constructor(public _el: ElementRef) {}
}
const LogiRadioButtonMixinBase:
    CanDisableRippleCtor &
    typeof LogiRadioButtonBase =
        mixinDisableRipple(LogiRadioButtonBase)

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.logi-radio-checked]': 'checked',
        '[class.logi-radio-disabled]': 'disabled',
        class: 'logi-radio-button',
    },
    inputs: ['disableRipple'],
    selector: 'logi-radio-button',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiRadioButtonComponent extends LogiRadioButtonMixinBase
implements CanDisableRipple, OnInit, AfterViewInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _focusMonitor: FocusMonitor,
        private _radioDispatcher: UniqueSelectionDispatcher,
        // tslint:disable-next-line: ng-property-naming-convention
        public el: ElementRef,
        @Optional() radioGroup: LogiRadioGroupDirective,
    ) {
        super(el)
        this.radioGroup = radioGroup
        this._removeUniqueSelectionListener = _radioDispatcher
            .listen((id: string, name: string) => {
                if (id !== this.id && name === this.name)
                    this.checked = false
            })
    }

    // tslint:disable: ext-variable-name
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_checked: BooleanInput

    @Input() public get checked(): boolean {
        return this._checked
    }

    public set checked(value: boolean) {
        const newCheck = coerceBooleanProperty(value)
        if (this._checked === newCheck)
            return
        this._checked = newCheck
        if (newCheck && this.radioGroup && this.radioGroup.value !== this.value)
            this.radioGroup.selected = this
        else if (!newCheck
            && this.radioGroup && this.radioGroup.value === this.value)
            this.radioGroup.selected = null

        if (newCheck)
            this._radioDispatcher.notify(this.id, this.name)
        this._cd.markForCheck()
    }

    @Input() public get value(): any {
        return this._value
    }

    public set value(value: any) {
        if (this._value === value)
            return
        this._value = value
        if (this.radioGroup === null)
            return
        if (!this.checked)
            this.checked = this.radioGroup.value === value
        if (this.checked)
            this.radioGroup.selected = this
    }

    @Input() public get labelPosition(): 'before' | 'after' {
        return this._labelPosition || (this.radioGroup
        && this.radioGroup.labelPosition) || 'after'
    }

    public set labelPosition(v) {
        this._labelPosition = v
    }

    @Input() public get disabled(): boolean {
        return this._disabled || (this.radioGroup !== null
            && this.radioGroup.disabled)
    }

    public set disabled(value) {
        const newDisabledState = coerceBooleanProperty(value)
        if (this._disabled !== newDisabledState) {
            this._disabled = newDisabledState
            this._cd.markForCheck()
        }
    }
    public radioGroup!: LogiRadioGroupDirective

    // tslint:disable-next-line: increment-decrement
    public uniqueId = `logi-radio-${ ++nextUniqueId }`
    @Input() public id: string = this.uniqueId
    /**
     * Analog to HTML 'name' attribute used to group radios for unique
     * selection.
     */
    @Input() public name = ''
    @Output() public readonly change$ = new EventEmitter<LogiRadioChange>()
    public onInputChange(event: Event): void {
        event.stopPropagation()
        const groupValueChanged = this.radioGroup
            && this.value !== this.radioGroup.value
        this.checked = true
        this._emitChangeEvent()

        if (this.radioGroup) {
            this.radioGroup.controlValueAccessorChangeFn(this.value)
            if (groupValueChanged)
                this.radioGroup.emitChangeEvent()
        }
    }

    // tslint:disable-next-line: prefer-function-over-method
    public onInputClick(event: Event): void {
        event.stopPropagation()
    }

    public markForCheck(): void {
        this._cd.markForCheck()
    }

    public ngOnInit(): void {
        if (this.radioGroup) {
            this.checked = this.radioGroup.value === this.value
            this.name = this.radioGroup.name
        }
    }

    public ngAfterViewInit(): void {
        this._focusMonitor.monitor(this._el, true).subscribe(focusOrigin => {
            if (!focusOrigin && this.radioGroup)
                this.radioGroup.touch()
        })
    }

    public ngOnDestroy(): void {
        this._focusMonitor.stopMonitoring(this._el)
        this._removeUniqueSelectionListener()
    }
    private _checked = false
    private _disabled = false
    private _value = null
    private _labelPosition!: 'before' | 'after'
    // tslint:disable-next-line: no-empty
    private _removeUniqueSelectionListener: () => void = () => {}
    private _emitChangeEvent(): void {
        this.change$.next(new LogiRadioChange(this, this._value))
    }
}
