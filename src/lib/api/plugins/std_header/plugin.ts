import {Writable} from '@logi/base/ts/common/mapped_types'
import {
    addTemplate,
    AddTemplatePayload,
    DefaultHeaderPayload,
    HistoryType,
    isRedoPayload,
    isUndoPayload,
    Payload,
    removeStandardHeader,
    RemoveStandardHeaderPayload,
    renameStandardHeader,
    RenameStandardHeaderPayload,
    setStandardHeader,
    SetStandardHeaderPayload,
    SetStdHeaderSetPayload,
} from '@logi/src/lib/api/payloads'
import {TemplateSet, TemplateSetBuilder} from '@logi/src/lib/template'
import {ReplaySubject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'

import {HistoryBuilder} from './history'
import {StdHeaderResult, StdHeaderResultBuilder} from './result'

export class Plugin extends Base<StdHeaderResult> {
    public type = PluginType.STD_HEADER
    public templateSet = new TemplateSetBuilder().build()
    public result$ = new ReplaySubject<StdHeaderResult>(1)

    // tslint:disable-next-line: max-func-body-length
    public handle(input: Readonly<Product>): void {
        const resultBuilder = new StdHeaderResultBuilder()
            .actionType(input.actionType)
        const undo = input.payloads.find((p: Payload): boolean =>
            isUndoPayload(p) && p.undoPlugin === HistoryType.TEMPLATE)
        if (undo !== undefined) {
            const undoSet = this._history.undo()
            if (undoSet === undefined)
                return
            this.updateTemplateSet(undoSet, false)
            const undoRes = resultBuilder.templateSet(this.templateSet).build()
            this.result$.next(undoRes)
            return
        }
        const redo = input.payloads.find((p: Payload): boolean =>
            isRedoPayload(p) && p.redoPlugin === HistoryType.TEMPLATE)
        if (redo !== undefined) {
            const redoSet = this._history.redo()
            if (redoSet === undefined)
                return
            this.updateTemplateSet(redoSet, false)
            const redoRes = resultBuilder.templateSet(this.templateSet).build()
            this.result$.next(redoRes)
            return
        }
        this._handlePayloads(input)
    }

    public updateTemplateSet(set: TemplateSet, isHistory = true): void {
        this.templateSet = set

        if (isHistory)
            this._history.add(set)
    }

    public setStdHeaderSetPayload(p: SetStdHeaderSetPayload): void {
        this._newSet = p.templateSet
        this._changed = true
    }

    public defaultHeaderPayload(p: DefaultHeaderPayload): void {
        // tslint:disable-next-line: no-type-assertion
        const newSet = this._newSet as Writable<TemplateSet>
        newSet.defaultHeader = p.defaultHeader
        this._changed = true
    }

    public addTemplatePayload(p: AddTemplatePayload): void {
        addTemplate(this._newSet, p.template)
        this._changed = true
    }

    public setStandardHeaderPayload(p: SetStandardHeaderPayload): void {
        setStandardHeader(this._newSet, p.standardHeader)
        this._changed = true
    }

    public removeStandardHeaderPayload(p: RemoveStandardHeaderPayload): void {
        removeStandardHeader(this._newSet, p.name)
        this._changed = true
    }

    public renameStandardHeaderPayload(p: RenameStandardHeaderPayload): void {
        renameStandardHeader(this._newSet, p.oldName, p.newName)
        this._changed = true
    }

    private _history = new HistoryBuilder().build()

    private _newSet = new TemplateSetBuilder().build()
    private _changed = false

    private _handlePayloads(input: Readonly<Product>): void {
        this._newSet = new TemplateSetBuilder(this.templateSet)
            .standardHeaders(this.templateSet.standardHeaders.slice())
            .build()
        this._changed = false
        this.handlePayloads(input)
        if (!this._changed)
            return
        this.updateTemplateSet(this._newSet)
        input.addChanged(this.type)
        const result = new StdHeaderResultBuilder()
            .templateSet(this.templateSet)
            .actionType(input.actionType)
            .build()
        this.result$.next(result)
    }
}

export const STD_HEADER_FORM = new FormBuilder()
    .type(PluginType.STD_HEADER)
    .deps([PluginType.BOOK])
    .ctor(Plugin)
    .build()
