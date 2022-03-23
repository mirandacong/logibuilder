/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    Directive,
    DoCheck,
    ElementRef,
    Input,
    OnDestroy,
    Optional,
} from '@angular/core'
import {FormGroupDirective, NgControl, NgForm} from '@angular/forms'
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState,
} from '@logi/src/web/ui/core'
import {LogiFormFieldControl} from '@logi/src/web/ui/form-field'
import {fromEvent, merge, Observable, Subscription} from 'rxjs'
import {map} from 'rxjs/operators'

export type Size = 'normal' | 'small' | 'large'

class LogiInputBase {
    public constructor(
        // tslint:disable: naming-convention
        public readonly _defaultErrorStateMatcher: ErrorStateMatcher,
        public readonly _parentForm: NgForm,
        public readonly _parentFormGroup: FormGroupDirective,
        public readonly ngControl: NgControl,
    ) {}
}

const _LogiInputMixinBase: CanUpdateErrorStateCtor & typeof LogiInputBase =
    mixinErrorState(LogiInputBase)

// tslint:disable: unknown-instead-of-any
@Directive({
    host: {
        '(blur)': 'focusChanged(false)',
        '(focus)': 'focusChanged(true)',
        '(input)': 'onInput()',
        '[class.logi-disabled]': 'disabled',
        '[class.logi-large]': 'size === "large"',
        '[class.logi-small]': 'size === "small"',
        '[disabled]': 'disabled',
        class: 'logi-input-element',
    },
    providers: [{
        provide: LogiFormFieldControl,
        useExisting: LogiInputDirective,
    }],
    selector: 'input[logi-input], textarea[logi-input]',
})
export class LogiInputDirective extends _LogiInputMixinBase implements
LogiFormFieldControl, DoCheck, OnDestroy, CanUpdateErrorState {
    public constructor(
        @Optional() public readonly _parentForm: NgForm,
        public readonly _defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() public readonly _parentFormGroup: FormGroupDirective,
        @Optional() public readonly ngControl: NgControl,
        private readonly _elementRef: ElementRef<HTMLInputElement>,
    ) {
        super(
            _defaultErrorStateMatcher,
            _parentForm,
            _parentFormGroup,
            ngControl,
        )
    }

    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_readonly: BooleanInput

    @Input() public size: Size = 'normal'

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null)
            return this.ngControl.disabled
        return this._disabled
    }

    @Input() public set readonly(value: boolean) {
        this._readonly = coerceBooleanProperty(value)
    }

    public get readonly(): boolean {
        return this._readonly
    }

    public focused = false

    public get empty(): boolean {
        return !this._elementRef.nativeElement.value
    }

    public get shouldLabelFloat(): boolean {
        return this.focused || !this.empty
    }

    public ngDoCheck(): void {
        if (this.ngControl)
            this.updateErrorState()
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    public onContainerClick(): void {
        if (this.focused)
            return
        this.focus()
    }

    // tslint:disable-next-line: prefer-function-over-method no-empty
    public onInput(): void {
        /**
         * Just make angular run a new change detection.
         * See angular material MatInput.
         */
    }

    public focus(): void {
        this._elementRef.nativeElement.focus()
    }

    public getValue(): string {
        return this._elementRef.nativeElement.value
    }

    // tslint:disable-next-line: unknown-instead-of-any
    public setValue(value: any): void {
        const normalizedValue = value === null ? '' : value
        this._elementRef.nativeElement.value = normalizedValue
    }

    public input$(): Observable<InputEvent> {
        return fromEvent<InputEvent>(this._elementRef.nativeElement, 'input')
    }

    public focus$(): Observable<FocusEvent> {
        return fromEvent<FocusEvent>(this._elementRef.nativeElement, 'focus')
    }

    public blur$(): Observable<FocusEvent> {
        return fromEvent<FocusEvent>(this._elementRef.nativeElement, 'blur')
    }

    public isFocused$(): Observable<boolean> {
        return merge(this.focus$(), this.blur$())
            .pipe(map(event => event.type === 'focus'))
    }

    public focusChanged(focused: boolean): void {
        if (focused === this.focused || (this.readonly && !focused))
            return
        this.focused = focused
        this.stateChanges$.next()
    }

    private _disabled = false
    private _readonly = false
    private _subs = new Subscription()
}
