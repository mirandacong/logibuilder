import {
    FocusHierarchyPayload,
    FocusSourcePayload,
    HistoryType,
    isRedoPayload,
    isUndoPayload,
    Payload,
} from '@logi/src/lib/api/payloads'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'

import {History} from './history'
import {
    FocusResult,
    FocusResultBuilder,
    HierarhcyFocus,
    HierarhcyFocusBuilder,
    SourceFocus,
    SourceFocusBuilder,
} from './result'

export class Plugin extends Base<FocusResult> {
    public type = PluginType.FOCUS
    public result$ = new Subject<FocusResult>()
    public handle(input: Readonly<Product>): void {
        const undo = input.payloads.find((p: Payload): boolean =>
            isUndoPayload(p) && p.undoPlugin === HistoryType.FOCUS)
        if (undo !== undefined) {
            const undoRes = this._history.undo()
            if (undoRes === undefined)
                return
            const res = new FocusResultBuilder()
                .hierarchy(undoRes[0])
                .source(undoRes[1])
                .actionType(input.actionType)
                .build()
            this.result$.next(res)
            return
        }
        const redo = input.payloads.find((p: Payload): boolean =>
            isRedoPayload(p) && p.redoPlugin === HistoryType.FOCUS)
        if (redo !== undefined) {
            const redoRes = this._history.redo()
            if (redoRes === undefined)
                return
            const res = new FocusResultBuilder()
                .hierarchy(redoRes[0])
                .source(redoRes[1])
                .actionType(input.actionType)
                .build()
            this.result$.next(res)
            return
        }
        this._handlePayloads(input)
        if (!this._changed)
            return
        const result = new FocusResultBuilder()
            .hierarchy(this._hierarchyFocus)
            .source(this._sourceFocus)
            .actionType(input.actionType)
            .build()
        input.addChanged(PluginType.FOCUS)
        this.result$.next(result)
        return
    }

    public focusHierarchyPayload(p: FocusHierarchyPayload): void {
        this._hierarchyFocus.push(new HierarhcyFocusBuilder(p).build())
    }

    public focusSourcePayload(p: FocusSourcePayload): void {
        this._sourceFocus.push(new SourceFocusBuilder(p).build())
    }

    private _history = new History()
    // tslint:disable-next-line: readonly-array
    private _hierarchyFocus: HierarhcyFocus[] = []
    // tslint:disable-next-line: readonly-array
    private _sourceFocus: SourceFocus[] = []
    private _changed = false
    private _handlePayloads(input: Readonly<Product>): void {
        this._hierarchyFocus = []
        this._sourceFocus = []
        this._changed = false
        this.handlePayloads(input)
        if ((this._hierarchyFocus.length === 0) &&
            (this._sourceFocus.length === 0))
            return
        this._changed = true
        this._history.add(this._hierarchyFocus, this._sourceFocus)
    }
}

export const FOCUS_FORM = new FormBuilder()
    .type(PluginType.FOCUS)
    .deps([])
    .ctor(Plugin)
    .build()
