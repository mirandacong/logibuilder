import {ChangeDetectorRef, Injector} from '@angular/core'
import {FormControl} from '@angular/forms'
import {Underline} from '@logi/src/lib/modifier'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {
    ExcelOperatorBuilder,
    OperateService,
    Operator,
} from '@logi/src/web/core/excel-preview/operator'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {ReadonlyService} from '@logi/src/web/global/readonly'

import {ModifierService} from './service'
import {ToolbarButton, FONT_SIZE_LIST, ZOOM_LIST} from './toolbar_type'

const BLACK = 'rgba(0, 0, 0, 0.12)'

export class ToolbarBase {
    public constructor(public readonly injector: Injector) {
        this.apiSvc = this.injector.get(StudioApiService)
        this.excelPreviewSvc = this.injector.get(OperateService)
        this.modifierSvc = this.injector.get(ModifierService)
        this.nodeFocusSvc = this.injector.get(NodeFocusService)
        this.cd = this.injector.get(ChangeDetectorRef)
        this.readonlySvc = this.injector.get(ReadonlyService)
    }
    public readonly apiSvc: StudioApiService
    public readonly excelPreviewSvc: OperateService
    public readonly modifierSvc: ModifierService
    public readonly readonlySvc: ReadonlyService
    public cd: ChangeDetectorRef
    public iconRippleColor = BLACK
    public readonly = true
    public zoomList = ZOOM_LIST
    public zoomCtrl = new FormControl('100%')
    public fontSizeList = FONT_SIZE_LIST
    public fontSizeCtrl = new FormControl('10')

    public onZoomChange (): void {
        if (!this.zoomCtrl.value.includes('%'))
            this.zoomCtrl.setValue(this.zoomCtrl.value + '%')
        if (!Number(this.zoomCtrl.value.split('%')[0]))
            return
        // tslint:disable-next-line: no-magic-numbers
        const z = Number(this.zoomCtrl.value.split('%')[0]) * 0.01
        const zoomOperator = new ExcelOperatorBuilder()
            .operator(Operator.ZOOM)
            .value(z)
            .build()
        this.excelPreviewSvc.setOperator(zoomOperator)
    }

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public setModifier (
        btn: ToolbarButton,
        value?: unknown,
        list?: readonly ToolbarButton[],
    ): void {
        if (value)
            btn.updateValue(value)
        switch (btn.operator) {
        case Operator.FONT_FAMILY:
            this.modifierSvc.setFamily()
            break
        case Operator.FONT_SIZE:
            if (!Number(
                this.fontSizeCtrl.value,
            ) || this.fontSizeCtrl.value <= 0)
                break
            btn.updateValue(this.fontSizeCtrl.value)
            this.modifierSvc.setSize(Number(btn.value))
            break
        case Operator.CURRENCY:
            this.modifierSvc.setCurrency()
            break
        case Operator.PERCENT:
            this.modifierSvc.setPercent()
            break
        case Operator.SEPARATOR:
            this.modifierSvc.setSeparator()
            break
        case Operator.POINT_INC:
            this.modifierSvc.setDecimalPlaces(false)
            break
        case Operator.POINT_DEC:
            this.modifierSvc.setDecimalPlaces(true)
            break
        case Operator.DECREASE:
            this.modifierSvc.setIndent(false)
            break
        case Operator.INCREASE:
            this.modifierSvc.setIndent(true)
            break
        case Operator.BOLD:
            btn.updateSelected(!btn.selected)
            this.modifierSvc.setBold(btn.selected)
            break
        case Operator.ITALIC:
            btn.updateSelected(!btn.selected)
            this.modifierSvc.setItalic(btn.selected)
            break
        case Operator.UNDERLINE:
            btn.updateSelected(!btn.selected)
            this.modifierSvc.setLine(btn.selected ? btn.value : Underline.NONE)
            if (!list)
                break
            list.forEach(b => {
                if (b.operator !== Operator.STRIKETHROUGH)
                    return
                if (b.selected && btn.selected)
                    b.updateSelected(false)
            })
            break
        case Operator.STRIKETHROUGH:
            btn.updateSelected(!btn.selected)
            this.modifierSvc.setLine(btn.selected ? btn.value : Underline.NONE)
            if (!list)
                break
            list.forEach(b => {
                if (b.operator !== Operator.UNDERLINE)
                    return
                if (b.selected && btn.selected)
                    b.updateSelected(false)
            })
            break
        default:
            return
        }
    }

    public getToolbarStatus (
        row: string,
        list: readonly ToolbarButton[]
    ): void {
        const m = this.apiSvc.getModifier(row)
        if (m === undefined) {
            list.forEach(btn => btn.updateDisabled(true))
            return
        }
        list.forEach(btn => {
            btn.updateDisabled(false)
            switch (btn.operator) {
            case Operator.BOLD:
                btn.updateSelected(m.font.bold)
                break
            case Operator.ITALIC:
                btn.updateSelected(m.font.italic)
                break
            case Operator.UNDERLINE:
                btn.updateSelected(m.font.line === Underline.SINGLE)
                break
            case Operator.STRIKETHROUGH:
                btn.updateSelected(m.font.line === Underline.SINGLE_ACCOUNTING)
                break
            case Operator.FONT_FAMILY:
                btn.updateValue(m.font.family)
                break
            case Operator.FONT_SIZE:
                btn.updateValue(m.font.size)
                this.fontSizeCtrl.setValue(m.font.size)
                break
            default:
            }
        })
    }
    protected nodeFocusSvc: NodeFocusService
}
