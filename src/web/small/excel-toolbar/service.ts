import {Injectable} from '@angular/core'
import {
    SetBoldActionBuilder,
    SetCurrencyActionBuilder,
    SetDecimalPlacesDeltaActionBuilder,
    SetFamilyActionBuilder,
    SetIndentDeltaActionBuilder,
    SetItalicActionBuilder,
    SetLineActionBuilder,
    SetPercentActionBuilder,
    SetSizeActionBuilder,
    SetThousandsSeparatorActionBuilder,
} from '@logi/src/lib/api'
import {isFormulaBearer} from '@logi/src/lib/hierarchy/core'
import {Currency, FontFamily, Underline} from '@logi/src/lib/modifier'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api'
import {NotificationService} from '@logi/src/web/ui/notification'

@Injectable()
export class ModifierService {
    public constructor(
        private readonly _studioApiSvc: StudioApiService,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _notificationSvc: NotificationService,
    ) {}

    public setIndent(isInden: boolean): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        this._studioApiSvc.handleAction(new SetIndentDeltaActionBuilder()
            .rows(rows)
            .delta(isInden ? 1 : -1)
            .build(),)
    }

    public setDecimalPlaces(isAddPlace: boolean): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        this._studioApiSvc.handleAction(new SetDecimalPlacesDeltaActionBuilder()
            .rows(rows)
            .decimalPlacesDelta(isAddPlace ? 1 : - 1)
            .build(),)
    }

    public setSize(size: number): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        this._studioApiSvc.handleAction(new SetSizeActionBuilder()
            .rows(rows)
            .size(size)
            .build(),)
    }

    public setFamily(): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        this._studioApiSvc.handleAction(new SetFamilyActionBuilder()
            .rows(rows)
            .family(FontFamily.CALIBRI)
            .build(),)
    }

    public setSeparator(): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        const m = this._studioApiSvc.getModifier(rows[0])
        if (m === undefined)
            return
        this._studioApiSvc.handleAction(new SetThousandsSeparatorActionBuilder()
            .rows(rows)
            .thousandsSeparator(!m.format.thousandsSeparator)
            .build(),)
    }

    public setCurrency(): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        const m = this._studioApiSvc.getModifier(rows[0])
        if (m === undefined)
            return
        const currency = m.format.currency
        this._studioApiSvc.handleAction(new SetCurrencyActionBuilder()
            .rows(rows)
            .currency(currency === Currency.CNY ? Currency.NONE : Currency.CNY)
            .build(),)
    }

    public setPercent(): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        const m = this._studioApiSvc.getModifier(rows[0])
        if (m === undefined)
            return
        this._studioApiSvc.handleAction(new SetPercentActionBuilder()
            .rows(rows)
            .percent(!m.format.percent)
            .build(),)
    }

    public setBold(bold: boolean): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        this._studioApiSvc.handleAction(new SetBoldActionBuilder()
            .rows(rows)
            .bold(bold)
            .build(),)
    }

    public setItalic(italic: boolean): void {
        const rows = this._getSelectRows()
        if (rows.length === 0)
            return
        this._studioApiSvc.handleAction(new SetItalicActionBuilder()
            .rows(rows)
            .italic(italic)
            .build(),)
    }

    public setLine(l: unknown): void {
        const rows = this._getSelectRows()
        let line = Underline.NONE
        if (rows.length === 0)
            return
        // tslint:disable-next-line: no-duplicate-case
        switch (l) {
        case Underline.DOUBLE:
            line = Underline.DOUBLE
            break
        case Underline.DOUBLE_ACCOUNTING:
            line = Underline.DOUBLE_ACCOUNTING
            break
        case Underline.SINGLE:
            line = Underline.SINGLE
            break
        case Underline.SINGLE_ACCOUNTING:
            line = Underline.SINGLE_ACCOUNTING
            break
        case Underline.UNDERLINE_UNSPECIFIED:
            line = Underline.UNDERLINE_UNSPECIFIED
            break
        default:
        }
        this._studioApiSvc.handleAction(new SetLineActionBuilder()
            .rows(rows)
            .line(line)
            .build(),)
    }

    private _getSelectRows(): readonly string[] {
        const selectNodes = this._nodeFocusSvc.getSelNodes()
        const unExceptNode = selectNodes.find(r => !isFormulaBearer(r))
        if (unExceptNode !== undefined) {
            this._notificationSvc.showError('只能对行或列设置格式')
            return []
        }
        return selectNodes.map(r => r.uuid)
    }
}
