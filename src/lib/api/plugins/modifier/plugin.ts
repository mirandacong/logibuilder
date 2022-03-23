import {Modification} from '@logi/base/ts/common/history'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    AddChildPayload,
    HistoryType,
    isRedoPayload,
    isUndoPayload,
    SetBoldPayload,
    SetCurrencyPayload,
    SetDecimalPlacesPayload,
    SetFamilyPayload,
    SetIndentPayload,
    SetItalicPayload,
    SetLinePayload,
    SetModifierManagerPayload,
    SetModifierPayload,
    SetPercentPayload,
    SetSizePayload,
    SetThousandsSeparatorPayload,
} from '@logi/src/lib/api/payloads'
import {BookPlugin} from '@logi/src/lib/api/plugins/book'
import {
    ALL_TYPES,
    getNodesVisitor,
    isRow,
    NodeType,
    Row,
} from '@logi/src/lib/hierarchy/core'
import {
    ModifierManager,
    SetBoldModificationBuilder,
    SetCurrencyModificationBuilder,
    SetDecimalPlacesModificationBuilder,
    SetFamilyModificationBuilder,
    SetIndentModificationBuilder,
    SetItalicModificationBuilder,
    SetLineModificationBuilder,
    SetModifierModificationBuilder,
    SetPercentModificationBuilder,
    SetSizeModificationBuilder,
    SetThousandsSeparatorModificationBuilder,
} from '@logi/src/lib/modifier'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'
import {ModifierHandler} from '../handler'

import {ModifierResult, ModifierResultBuilder} from './result'

export class Plugin extends Base<ModifierResult> implements ModifierHandler {
    public constructor(
        private readonly _book: BookPlugin,
    ) {
        super()
    }

    public result$ = new Subject<ModifierResult>()
    public type = PluginType.MODIFIER
    public modifierManager = new ModifierManager([])
    public handle(input: Readonly<Product>): void {
        const undo = input.payloads.find(
            p => isUndoPayload(p) && p.undoPlugin === HistoryType.MODIFIER,
        )
        if (undo !== undefined) {
            this.modifierManager.undo()
            const undoRes = new ModifierResultBuilder()
                .actionType(input.actionType)
                .modifierManager(this.modifierManager)
                .build()
            this.result$.next(undoRes)
            return
        }
        const redo = input.payloads.find(
            p => isRedoPayload(p) && p.redoPlugin === HistoryType.MODIFIER,
        )
        if (redo !== undefined) {
            this.modifierManager.redo()
            const redoRes = new ModifierResultBuilder()
                .actionType(input.actionType)
                .modifierManager(this.modifierManager)
                .build()
            this.result$.next(redoRes)
            return
        }
        this._handlePayloads(input)
        if (!this._changed)
            return
        input.addChanged(PluginType.MODIFIER)
        const result = new ModifierResultBuilder()
            .actionType(input.actionType)
            .modifierManager(this.modifierManager)
            .build()
        this.result$.next(result)
    }

    public setBoldPayload(p: SetBoldPayload): void {
        this._mods.push(new SetBoldModificationBuilder()
            .row(p.row)
            .bold(p.bold)
            .build())
    }

    public setFamilyPayload(p: SetFamilyPayload): void {
        this._mods.push(new SetFamilyModificationBuilder()
            .row(p.row)
            .family(p.family)
            .build())
    }

    public setCurrencyPayload(p: SetCurrencyPayload): void {
        this._mods.push(new SetCurrencyModificationBuilder()
            .row(p.row)
            .currency(p.currency)
            .build())
    }

    public setDecimalPlacesPayload(p: SetDecimalPlacesPayload): void {
        this._mods.push(new SetDecimalPlacesModificationBuilder()
            .row(p.row)
            .decimalPlaces(p.decimalPlaces)
            .build())
    }

    public setIndentPayload(p: SetIndentPayload): void {
        this._mods.push(new SetIndentModificationBuilder()
            .row(p.row)
            .indent(p.indent)
            .build())
    }

    public setItalicPayload(p: SetItalicPayload): void {
        this._mods.push(new SetItalicModificationBuilder()
            .row(p.row)
            .italic(p.italic)
            .build())
    }

    public setLinePayload(p: SetLinePayload): void {
        this._mods.push(new SetLineModificationBuilder()
            .row(p.row)
            .line(p.line)
            .build())
    }

    public setPercentPayload(p: SetPercentPayload): void {
        this._mods.push(new SetPercentModificationBuilder()
            .row(p.row)
            .percent(p.percent)
            .build())
    }

    public setSizePayload(p: SetSizePayload): void {
        this._mods.push(new SetSizeModificationBuilder()
            .row(p.row)
            .size(p.size)
            .build())
    }

    public setThousandsSeparatorPayload(p: SetThousandsSeparatorPayload): void {
        this._mods.push(new SetThousandsSeparatorModificationBuilder()
            .row(p.row)
            .thousandsSeparator(p.thousandsSeparator)
            .build())
    }

    public setModifierPayload(p: SetModifierPayload): void {
        this._mods.push(new SetModifierModificationBuilder()
            .row(p.row)
            .modifier(p.modifier)
            .build())
    }

    public addChildPayload(p: AddChildPayload): void {
        const nodes = preOrderWalk(p.child, getNodesVisitor, ALL_TYPES)
        const rows = nodes
            .map(n => this._book.nodesMap.get(n.uuid))
            .filter(isRow)
        rows.forEach((row: Readonly<Row>): void => {
            let parent = row.parent
            let indent = 0
            while (parent !== null && parent.nodetype === NodeType.ROW_BLOCK) {
                indent += 1
                parent = parent.parent
            }
            this._mods.push(new SetIndentModificationBuilder()
                .row(row.uuid)
                .indent(indent)
                .build())
        })
    }

    public setModifierManagerPayload(p: SetModifierManagerPayload): void {
        this.modifierManager = p.modifierManager
        this._changed = true
    }

    // tslint:disable-next-line: readonly-array
    private _mods: Modification[] = []

    private _changed = false

    private _handlePayloads(input: Readonly<Product>): void {
        this._changed = false
        this.handlePayloads(input)
        if (this._mods.length === 0)
            return
        this.modifierManager.apply(this._mods)
        this._changed = true
    }
}

export const MODIFIER_FORM = new FormBuilder()
    .type(PluginType.MODIFIER)
    .deps([
        PluginType.BOOK,
    ])
    .ctor(Plugin)
    .build()
