// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    Renderer2,
    ViewEncapsulation,
} from '@angular/core'
import {addClass} from '@logi/src/web/base/utils'
import {
    isPresetColor,
    PresetColor,
    PRESETCOLORSMAP,
} from '@logi/src/web/ui/common/color'

class LogiTagBase {
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

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.disabled]': 'disabled || null',
        '[style.background-color]': 'isPresetColor ? "" : colour+"1F"', // opacity: 0.12
        '[style.border-color]': 'isPresetColor ? "" : colour+"3D"', // opacity: 0.24
        '[style.color]': 'isPresetColor ? "" : colour',
    },
    inputs: ['disableRipple', 'disabled'],
    selector: 'logi-tag',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class LogiTagComponent extends LogiTagBase
    implements CanDisable, CanDisableRipple {
    @Input() public set color(color: string | PresetColor) {
        if (color === undefined)
            return
        this.isPresetColor = isPresetColor(color)
        this.colour = color

        if (this.isPresetColor) {
            const tag = this.getHostElement()
            addClass(tag, `logi-tag-${color}`)
            const res = PRESETCOLORSMAP.get(this.colour)
            if (res !== undefined)
                this.rippleColor = res + '1F' // ripple: 0.12
            return
        }
        this.rippleColor = this.colour + '1F'
    }

    @Input() public set mode(mod: 'default' | 'closeable') {
        if (mod === this.mod)
            return
        this.mod = mod
        const tag = this.getHostElement()
        addClass(tag, 'editable-tag')
    }
    public constructor(
        private readonly _el: ElementRef,
        private readonly _renderer: Renderer2,
    ) {
        super(_el)
        this._setHostClass()
    }
    public rippleColor = '#0000001F'
    @Input() public text = ''
    @Input() public icon = ''
    @Input() public fontIcon: string | undefined
    /**
     * 是否超出内容显示省略号
     */
    @Input() public ellipsis = false
    @Output() public readonly close$ = new EventEmitter<MouseEvent>()
    public isPresetColor = false
    public colour?: PresetColor | string
    public mod = 'default'

    public onEditTag(str: string): void {
        this.text = str
    }

    public onClose(e: MouseEvent): void {
        this.close$.next(e)
        if (!e.defaultPrevented)
            this._renderer.removeChild(
                this._renderer.parentNode(this.getHostElement()),
                this.getHostElement(),
            )
    }

    public isCloseableMode(): boolean {
        return this.mod === 'closeable'
    }

    public isIconTag(): boolean {
        // tslint:disable-next-line: no-double-negation
        return !!this.icon && this.icon.trim().length > 0
    }

    public isRippleDisabled(): boolean {
        return this.disableRipple || this.disabled
    }

    public getHostElement(): HTMLElement {
        return this._el.nativeElement
    }

    private _setHostClass(): void {
        const tag = this.getHostElement()
        addClass(tag, 'logi-tag-base')
    }
}
