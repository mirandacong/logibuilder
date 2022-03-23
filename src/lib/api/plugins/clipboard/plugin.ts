import {ClipBoardPayload} from '@logi/src/lib/api/payloads'
import {isSliceExpr, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {FormBuilder} from '../form'

import {ClipboardBuilder} from './lib'
import {ClipboardResult, ClipboardResultBuilder} from './result'

export class Plugin extends Base<ClipboardResult> {
    public type = PluginType.CLIPBOARD
    public result$ = new Subject<ClipboardResult>()
    public clipboard = new ClipboardBuilder().build()
    public handle(input: Readonly<Product>): void {
        this._handlePayloads(input)
        return
    }

    public clipBoardPayload(p: ClipBoardPayload): void {
        this._cutChanged = true
        if (isSlices(p.content))
            this.clipboard.setSlices(p.content.map(c => c.uuid), p.isCut)
        else
            this.clipboard.setNodes(p.content.map(c => c.uuid), p.isCut)
    }

    public addChildPayload(): void {
        this._clearCut()
    }

    public removeChildPayload(): void {
        this._clearCut()
    }

    public undoPayload(): void {
        this._clearCut()
    }

    public redoPayload(): void {
        this._clearCut()
    }

    private _cutChanged = false

    private _handlePayloads(input: Readonly<Product>): void {
        this._cutChanged = false
        this.handlePayloads(input)

        if (this._cutChanged)
            this.result$.next(new ClipboardResultBuilder()
                .actionType(input.actionType)
                .cutNodes(this.clipboard.isCut ? this.clipboard.nodes : [])
                .build())
    }

    private _clearCut(): void {
        if (!this.clipboard.isCut)
            return
        this._cutChanged = true
        this.clipboard.clear()
    }
}

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
function isSlices(array: readonly unknown[]): array is readonly SliceExpr[] {
    return isSliceExpr(array[0])
}

export const CLIPBOARD_FORM = new FormBuilder()
    .type(PluginType.CLIPBOARD)
    .ctor(Plugin)
    .deps([
        PluginType.BOOK,
    ])
    .build()
