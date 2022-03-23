import {
    HistoryType,
    isRedoPayload,
    isUndoPayload,
    Payload,
    SetSourceManagerPayload,
    SetSourcePayload,
} from '@logi/src/lib/api/payloads'
import {
    SetSourceModification,
    SetSourceModificationBuilder,
    SourceManager,
} from '@logi/src/lib/source'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'

import {SourceResult, SourceResultBuilder} from './result'

export class Plugin extends Base<SourceResult> {
    public type = PluginType.SOURCE
    public result$ = new Subject<SourceResult>()

    public sourceManager: SourceManager = new SourceManager([])

    public handle(input: Readonly<Product>): void {
        const resultBuilder = new SourceResultBuilder()
            .actionType(input.actionType)
        const undo = input.payloads.find((p: Payload): boolean =>
            isUndoPayload(p) && p.undoPlugin === HistoryType.SOURCE)
        if (undo !== undefined) {
            this.sourceManager.undo()
            resultBuilder.sourceManager(this.sourceManager)
            this.result$.next(resultBuilder.build())
            return
        }
        const redo = input.payloads.find((p: Payload): boolean =>
            isRedoPayload(p) && p.redoPlugin === HistoryType.SOURCE)
        if (redo !== undefined) {
            this.sourceManager.redo()
            resultBuilder.sourceManager(this.sourceManager)
            this.result$.next(resultBuilder.build())
            return
        }
        this._handlePayloads(input)
        if (!this._changed)
            return

        input.addChanged(this.type)
        resultBuilder.sourceManager(this.sourceManager)
        this.result$.next(resultBuilder.build())
        return
    }

    public setSourceManagerPayload(p: SetSourceManagerPayload): void {
        this.sourceManager = p.sourceManager
        this._changed = true
    }

    public setSourcePayload(p: SetSourcePayload): void {
        this._mods.push(new SetSourceModificationBuilder()
            .row(p.row)
            .col(p.col)
            .source(p.source)
            .build())
    }

    private _changed = false
    // tslint:disable-next-line: readonly-array
    private _mods: SetSourceModification[] = []

    private _handlePayloads(input: Readonly<Product>): void {
        this._mods = []
        this._changed = false
        this.handlePayloads(input)

        if (this._mods.length === 0)
            return
        this.sourceManager.apply(this._mods)
        this._changed = true
    }
}

export const SOURCE_FORM = new FormBuilder()
    .type(PluginType.SOURCE)
    .deps([PluginType.BOOK])
    .ctor(Plugin)
    .build()
