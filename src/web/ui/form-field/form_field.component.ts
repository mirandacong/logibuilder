/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable: no-null-keyword
// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {LogiSizeLDSType} from '@logi/src/web/base/types'
import {Subscription, timer} from 'rxjs'
import {startWith} from 'rxjs/operators'

import {matFormFieldAnimations} from './form_field_animations'
import {LogiFormFieldControl} from './form_field_control'
import {LogiPrefixDirective} from './prefix.directive'
import {LogiSuffixDirective} from './suffix.directive'

const OUTLINE_START_CLASS = '.logi-form-field-outline-start'
const OUTLINE_GAP_CLASS = '.logi-form-field-outline-gap'
const OUTLINE_GAP_PADDING = 5

@Component({
    animations: [matFormFieldAnimations.transitionMessages],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.logi-focused]': 'control.focused',
        '[class.logi-form-field-disabled]': 'control.disabled',
        '[class.logi-form-field-invalid]': 'control.errorState',
        '[class.logi-form-field-should-float]': 'shouldLabelFloat()',
        '[class.logi-large]': 'size === "large"',
        '[class.logi-small]': 'size === "small"',
        class: 'logi-form-field',
    },
    selector: 'logi-form-field',
    styleUrls: [
        './form_field.style.scss',
        './form_field_input.style.scss',
    ],
    templateUrl: './form_field.template.html',
})
export class LogiFormFieldComponent implements AfterContentInit, AfterViewInit,
OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _ngZone: NgZone,
    ) {}
    @Input() public set label(value: string) {
        this._label = value
    }

    public get label(): string {
        return this._label
    }

    @Input() public set size(value: LogiSizeLDSType) {
        this._size = value
    }

    public get size(): LogiSizeLDSType {
        return this._size
    }

    @Input() public set errorMsg(value: string) {
        this._errorMsg = value
    }

    public get errorMsg(): string {
        const control = this.control.ngControl
        if (!control || this._errorMsg)
            return this._errorMsg
        if (control.errors === null)
            return ''
        // tslint:disable-next-line: no-object
        const keys = Object.keys(control.errors)
        if (keys.length === 0)
            return ''
        const error = control.errors[keys[0]]
        if (typeof error !== 'string')
            return `${keys[0]}验证不通过`
        return error
    }

    public get control(): LogiFormFieldControl {
        return this._control
    }

    @ContentChildren(LogiPrefixDirective, {descendants: true})
    public readonly prefixChildren!: QueryList<LogiPrefixDirective>
    @ContentChildren(LogiSuffixDirective, {descendants: true})
    public readonly suffixChildren!: QueryList<LogiSuffixDirective>

    public subscriptAnimationState = ''

    public ngAfterContentInit(): void {
        this._subs.add(
            this.control.stateChanges$.pipe(startWith(null)).subscribe(() => {
                this._cd.markForCheck()
            }),
        )
        if (this.control.ngControl && this.control.ngControl.valueChanges) {
            const valueChange$ = this.control.ngControl.valueChanges
            this._subs.add(valueChange$.subscribe(() => {
                this._cd.markForCheck()
            }))
        }

        this._ngZone.runOutsideAngular(() => {
            this._subs.add(this._ngZone.onStable.asObservable().subscribe((
            ) => {
                if (!this._outlineGapCalculationNeededOnStable)
                    return
                /**
                 * https://github.com/angular/components/issues/15027
                 * 使用 NoopAnimationModule也可以解决问题，但是会关闭所有动画
                 * 这里设置一定的等待时间，等待 Dialog 动画完成
                 * TODO(zengkai): 如果有更好的方案，就移除 timer
                 */
                const wait = 100
                timer(wait).subscribe(() => {
                    this._updateOutlineGap()
                })
            }))
        })
    }

    public ngAfterViewInit(): void {
        this.subscriptAnimationState = 'enter'
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    public hasLabel(): boolean {
        /**
         * Now only input with large size should display label.
         */
        if (this.size !== 'large')
            return false
        return this.label.trim().length !== 0
    }

    public hasError(): boolean {
        return this.control.errorState
    }

    public shouldLabelFloat(): boolean {
        return this.control.shouldLabelFloat
    }

    @ViewChild('connection_container')
    private readonly _connectionContainerRef!: ElementRef<HTMLElement>
    @ViewChild('label_el') private readonly _labelRef?: ElementRef<HTMLElement>

    @ContentChild(LogiFormFieldControl, {static: true})
    private readonly _control!: LogiFormFieldControl

    private _subs = new Subscription()
    /**
     * Whether the outline gap needs to be calculated
     * immediately on the next change detection run.
     */
    // @ts-ignore
    private _outlineGapCalculationNeededImmediately = false

    /**
     * Whether the outline gap needs to be calculated next time the zone has
     * stabilized.
     */
    private _outlineGapCalculationNeededOnStable = true
    private _label = ''
    private _errorMsg = ''
    private _size: LogiSizeLDSType = 'default'

    private _updateOutlineGap(): void {
        const labelEl = this._labelRef ? this._labelRef.nativeElement : null
        if (!labelEl || !labelEl.children.length)
            return
        let startWidth = 0
        let gapWidth = 0

        const container = this._connectionContainerRef.nativeElement
        const startEls = container.querySelectorAll(OUTLINE_START_CLASS)
        const gapEls = container.querySelectorAll(OUTLINE_GAP_CLASS)

        if (this._labelRef && this._labelRef.nativeElement.children.length) {
            const containerRect = container.getBoundingClientRect()

            if (containerRect.width === 0 && containerRect.height === 0) {
                this._outlineGapCalculationNeededOnStable = true
                this._outlineGapCalculationNeededImmediately = false
                return
            }

            const containerStart = containerRect.left
            const labelStart = labelEl.children[0].getBoundingClientRect().left
            let labelWidth = 0

            Array.from(labelEl.children).forEach(child => {
                // tslint:disable-next-line: no-type-assertion
                labelWidth += (child as HTMLElement).offsetWidth
            })
            startWidth = Math.abs(labelStart - containerStart) -
                OUTLINE_GAP_PADDING
            gapWidth = labelWidth > 0 ?
                // tslint:disable-next-line: no-magic-numbers
                labelWidth * 0.75 + OUTLINE_GAP_PADDING * 2 : 0
        }

        // tslint:disable: prefer-for-of
        for (let i = 0; i < startEls.length; i += 1)
            // tslint:disable-next-line: no-type-assertion
            (startEls[i] as HTMLElement).style.width = `${startWidth}px`
        for (let i = 0; i < gapEls.length; i += 1)
            // tslint:disable-next-line: no-type-assertion
            (gapEls[i] as HTMLElement).style.width = `${gapWidth}px`

        this._outlineGapCalculationNeededOnStable =
        this._outlineGapCalculationNeededImmediately = false
    }
}
