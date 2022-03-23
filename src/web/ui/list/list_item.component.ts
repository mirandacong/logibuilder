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
    Optional,
    ViewEncapsulation,
} from '@angular/core'
import {
    CanDisableRipple,
    CanDisableRippleCtor,
    mixinDisableRipple,
} from '@logi/src/web/ui/core'

import {LogiListComponent} from './list.component'

// tslint:disable-next-line: no-empty-class
class LogiListItemBase {}

// tslint:disable-next-line: naming-convention
const LogiListItemMixinBase: CanDisableRippleCtor & typeof LogiListItemBase =
    mixinDisableRipple(LogiListItemBase)

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'logi-list-item',
    },
    selector: 'logi-list-item, a[logi-list-item], button[logi-list-item]',
    styleUrls: ['./list_item.style.scss'],
    templateUrl: './list_item.template.html',
})
export class LogiListItemComponent extends LogiListItemMixinBase implements
CanDisableRipple {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
        @Optional() private readonly _list: LogiListComponent,
    ) {
        super()
        this._isInteractiveList = this._list && this._list.isInteractiveList()
    }

    public static ngAcceptInputType_disableRipple: BooleanInput
    public static ngAcceptInputType_disabled: BooleanInput

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        return this._disabled
    }

    public getHostElement(): HTMLElement {
        return this._el.nativeElement
    }

    public isRippleDisabled(): boolean {
        return !this._isInteractiveList || this.disableRipple ||
            // tslint:disable-next-line: no-double-negation
            !!(this._list && this._list.disableRipple)
    }

    private _disabled = false
    private _isInteractiveList = false
}
