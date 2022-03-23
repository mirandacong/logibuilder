// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewEncapsulation,
} from '@angular/core'
import {LogiSizeDSType} from '@logi/src/web/base/types'
import {addClass, removeClass} from '@logi/src/web/base/utils'

class LogiButtonBase {
    // tslint:disable-next-line: ng-property-naming-convention
    public constructor(public readonly el: ElementRef) {}

    // tslint:disable: ng-no-get-and-set-property
    public get disabled(): boolean {
        return this._disabled
    }

    public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disableRipple(): boolean {
        return this._disableRipple
    }

    public set disableRipple(value: boolean) {
        this._disableRipple = coerceBooleanProperty(value)
    }

    private _disabled = false
    private _disableRipple = false
}

interface CanDisable {
    readonly disabled: boolean
}

interface CanDisableRipple {
    readonly disableRipple: boolean
}

export type ButtonAppearance = 'basic' | 'stroked' | 'flat'
export type ButtonPalette = 'primary' | 'secondary' | 'warn' | undefined

function getColorClass(color: ButtonPalette): string {
    return color === undefined ? '' : `logi-${color}`
}

function getAppearanceClass(appearance: ButtonAppearance): string {
    return appearance === 'basic' ? '' : `logi-${appearance}`
}

// tslint:disable-next-line: ter-max-len
const BUTTON_HOST_ATTRIBUTES: readonly (readonly [string, ButtonAppearance])[] = [
    ['logi-button', 'basic'],
    ['logi-stroked-button', 'stroked'],
    ['logi-flat-button', 'flat'],
    ['logi-icon-button', 'basic'],
    ['logi-icon-text-button', 'basic'],
]

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.disabled]': 'disabled || null',
        '[class.loading]': 'loading',
        '[class.logi-button-dark-theme]': 'dark',
        '[class.logi-button-small]': 'size === "small"',
        class: 'logi-button-base',
    },
    inputs: ['disableRipple', 'disabled'],
    selector: `button[logi-button], button[logi-stroked-button],
        button[logi-flat-button], button[logi-icon-button], button[logi-icon-text-button]`,
    styleUrls: [
        // tslint:disable-next-line: ng-sort-arrays
        './style.scss',
        './logi_button.style.scss',
        './logi_flat_button.style.scss',
        './logi_icon_button.style.scss',
        './logi_icon_text_button.style.scss',
        './logi_stroked_button.style.scss',
    ],
    templateUrl: './template.html',
})
export class LogiButtonComponent extends LogiButtonBase
implements CanDisable, CanDisableRipple {
    public constructor(private readonly _el: ElementRef<HTMLElement>) {
        super(_el)
        this._setHostClass()
    }

    /**
     * For make strictest type checking pass.
     * See: https://angular.io/guide/template-typecheck
     */
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_disableRipple: BooleanInput
    public static ngAcceptInputType_dark: BooleanInput
    public static ngAcceptInputType_rippleCentered: BooleanInput

    @Input() public set size(value: LogiSizeDSType) {
        this._size = value
    }

    public get size(): LogiSizeDSType {
        return this._size
    }

    @Input() public set appearance(appearance: ButtonAppearance) {
        if (appearance === undefined || appearance === this._appearance)
            return
        const button = this.getHostElement()
        removeClass(button, getAppearanceClass(this._appearance))
        addClass(button, getAppearanceClass(appearance))
        this._appearance = appearance
    }

    @Input() public set color(color: ButtonPalette) {
        if (color === undefined || color === this._color)
            return
        const button = this.getHostElement()
        removeClass(button, getColorClass(this._color))
        addClass(button, getColorClass(color))
        this._color = color
    }

    @Input() public set dark(value: boolean) {
        this._dark = coerceBooleanProperty(value)
    }

    public get dark(): boolean {
        return this._dark
    }

    @Input() public set rippleCentered(value: boolean) {
        this._rippleCentered = coerceBooleanProperty(value)
    }

    public get rippleCentered(): boolean {
        return this._rippleCentered
    }

    @Input() public rippleColor = ''
    @Input() public icon = ''
    @Input() public fontIcon: string | undefined
    @Input() public tooltip: string | undefined
    @Input() public set loading(loading: boolean) {
        if (loading === undefined || !loading || this.disabled) {
            this._loading = false
            return
        }
        this._loading = true
    }

    public get loading(): boolean {
        return this._loading
    }

    public isIconButton = this._hasHostAttributes(
        'logi-icon-button',
        'logi-icon-text-button',
    )

    /**
     * Now only flat button can have loading state.
     */
    public isFlatButton = this._hasHostAttributes('logi-flat-button')

    public getHostElement(): HTMLElement {
        return this._el.nativeElement
    }

    public isRippleDisabled(): boolean {
        return this.disableRipple || this.disabled
    }

    private _loading = false
    private _size: LogiSizeDSType = 'default'
    private _appearance: ButtonAppearance = 'basic'
    private _color: ButtonPalette = 'primary'
    private _dark = false
    private _rippleCentered = false

    private _hasHostAttributes(...attributes: readonly string[]): boolean {
        return attributes.some(attr => this.getHostElement().hasAttribute(attr))
    }

    private _setHostClass(): void {
        const button = this.getHostElement()
        BUTTON_HOST_ATTRIBUTES.forEach(attr => {
            if (button.hasAttribute(attr[0])) {
                addClass(button, attr[0])
                this.appearance = attr[1]
            }
        })
        /**
         * The default color is secondary for logi-icon-button.
         */
        if (this._hasHostAttributes('logi-icon-button'))
            this._color = 'secondary'
        addClass(button, getColorClass(this._color))
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '(click)': 'haltDisabledEvent($event)',
        '[attr.disabled]': 'disabled || null',
        '[attr.rel]': '"noopener"',
    },
    inputs: ['disableRipple', 'disabled'],
    selector: `a[logi-button], a[logi-stroked-button], a[logi-flat-button],
        a[logi-icon-button], a[logi-icon-text-button]`,
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiAnchorComponent extends LogiButtonComponent {
    public haltDisabledEvent(e: Event): void {
        /**
         * A disabled button shouldn't apply any actions.
         */
        if (this.disabled) {
            e.preventDefault()
            e.stopImmediatePropagation()
        }
    }
}
