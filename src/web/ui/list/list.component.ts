// tslint:disable:ext-variable-name variable-name component-selector
// tslint:disable:codelyzer-template-property-should-be-public
// tslint:disable: no-inputs-metadata-property no-host-metadata-property
// tslint:disable: use-component-view-encapsulation
import {BooleanInput} from '@angular/cdk/coercion'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewEncapsulation,
} from '@angular/core'
import {addClass} from '@logi/src/web/base/utils'
import {
    CanDisableRipple,
    CanDisableRippleCtor,
    mixinDisableRipple,
} from '@logi/src/web/ui/core'

// tslint:disable-next-line: no-empty-class
class LogiListBase {}

// tslint:disable-next-line: naming-convention
const LogiListMixinBase: CanDisableRippleCtor & typeof LogiListBase =
    mixinDisableRipple(LogiListBase)

// tslint:disable: no-null-keyword
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'logi-list',
    },
    selector: 'logi-list, logi-action-list, logi-nav-list',
    styleUrls: ['./list.style.scss'],
    templateUrl: './list.template.html',
})
export class LogiListComponent extends LogiListMixinBase implements
CanDisableRipple {
    public constructor(private readonly _el: ElementRef<HTMLElement>) {
        super()
        this._addListTypeClass()
    }

    public static ngAcceptInputType_disableRipple: BooleanInput
    public static ngAcceptInputType_disabled: BooleanInput

    public getListType(): 'list' | 'action-list' | 'nav-list' | null {
        const nodeName = this._el.nativeElement.nodeName.toLowerCase()
        if (nodeName === 'logi-list')
            return 'list'
        if (nodeName === 'logi-action-list')
            return 'action-list'
        if (nodeName === 'logi-nav-list')
            return 'nav-list'
        return null
    }

    public isInteractiveList(): boolean {
        const type = this.getListType()
        return type === 'action-list' || type === 'nav-list'
    }

    private _addListTypeClass(): void {
        if (this.getListType() === 'list')
            return
        const type = this.getListType()
        if (type === null)
            return
        addClass(this._el.nativeElement, `logi-${type}`)
    }
}
