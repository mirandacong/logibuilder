import {debugTimer} from '@logi/base/ts/common/debug'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    AddChildPayload,
    AddLabelPayload,
    AddSheetPayload,
    AddSlicePayload,
    HistoryType,
    RedoPayload,
    RemoveChildPayload,
    RemoveLabelPayload,
    RemoveSheetPayload,
    RemoveSlicePayload,
    SetAliasPayload,
    SetBookPayload,
    SetDataTypePayload,
    SetExpressionPayload,
    SetNamePayload,
    SetSliceExprPayload,
    SetSliceNamePayload,
    SetSliceTypePayload,
    SetTypePayload,
    UndoPayload,
    UpdateRdepExprPayload,
} from '@logi/src/lib/api/payloads'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {
    FB_TYPES,
    FormulaBearer,
    getNodesVisitor,
    isBook,
    isColumnBlock,
    isFormulaBearer,
    isRow,
    isRowBlock,
    isTable,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {Subject} from 'rxjs'

import {Plugin as Base, PluginType, Product, Result} from '../base'
import {Plugin as BookPlugin} from '../book/plugin'
import {FormBuilder} from '../form'
import {
    EditorHandler,
    HierarchyHandler,
    HistoryHandler,
    RenderHandler,
} from '../handler'

import {History} from './history'

export class Plugin extends Base<Result>
    implements HierarchyHandler, HistoryHandler, EditorHandler, RenderHandler {
    public constructor(
        private readonly _book: BookPlugin,
    ) {
        super()
    }
    public type = PluginType.EXPR
    public result$ = new Subject<Result>()
    public exprManager = new ExprManager()
    // tslint:disable-next-line: readonly-array
    public changedFormulas: string[] = []

    @debugTimer('expr plugin')
    public handle(input: Readonly<Product>): void {
        this._handlePayloads(input)
        this.changedFormulas = [
            ...Array.from(this._newExpr),
            ...Array.from(this._oldExpr),
        ]
    }

    public addSlicePayload(p: AddSlicePayload): void {
        this._newExpr.add(p.uuid)
    }

    public setExpressionPayload(p: SetExpressionPayload): void {
        this._newExpr.add(p.uuid)
    }

    public setSliceExprPayload(p: SetSliceExprPayload): void {
        this._newExpr.add(p.uuid)
    }

    public setSliceNamePayload(p: SetSliceNamePayload): void {
        this._newExpr.add(p.uuid)
    }

    public removeSlicePayload(p: RemoveSlicePayload): void {
        this._oldExpr.add(p.uuid)
    }

    public setTypePayload(p: SetTypePayload): void {
        this._oldExpr.add(p.uuid)
    }

    public setSliceTypePayload(p: SetSliceTypePayload): void {
        this._oldExpr.add(p.uuid)
    }

    public setDataTypePayload(p: SetDataTypePayload): void {
        this._oldExpr.add(p.uuid)
        const rdeps = getRdeps(p.uuid, this.exprManager, this._book.nodesMap)
        rdeps.forEach((uuid: string): void => {
            this._oldExpr.add(uuid)
        })
    }

    public addLabelPayload(p: AddLabelPayload): void {
        this._calUpdateExprs(p.uuid)
    }

    public removeLabelPayload(p: RemoveLabelPayload): void {
        this._calUpdateExprs(p.uuid)
    }

    public setNamePayload(p: SetNamePayload): void {
        const map = this._book.nodesMap
        const node = map.get(p.uuid)
        if (isBook(node))
            return
        this._calUpdateExprs(p.uuid)
        Array.from(this.exprManager.errorStorage.udfRef.keys()).forEach((
            uuid: string,
        ): void => {
            this._oldExpr.add(uuid)
        })
    }

    public setAliasPayload(p: SetAliasPayload): void {
        const map = this._book.nodesMap
        const rdeps = getRdeps(p.uuid, this.exprManager, map)
        rdeps.forEach((uuid: string): void => {
            this._oldExpr.add(uuid)
        })
        Array.from(this.exprManager.errorStorage.udfRef.keys()).forEach((
            uuid: string,
        ): void => {
            this._oldExpr.add(uuid)
        })
    }

    public addChildPayload(p: AddChildPayload): void {
        const fbs = preOrderWalk(p.child, getNodesVisitor, FB_TYPES)
            .filter(isFormulaBearer)
        fbs.forEach((fb: Readonly<FormulaBearer>): void => {
            this._newExpr.add(fb.uuid)
        })
        this._calUpdateExprs(p.child.uuid)
        Array.from(this.exprManager.errorStorage.udfRef.keys()).forEach((
            uuid: string,
        ): void => {
            this._oldExpr.add(uuid)
        })
    }

    public addSheetPayload(p: AddSheetPayload): void {
        const sheet = this._book.book.sheets.find(s => s.name === p.name)
        if (sheet === undefined)
            return
        const fbs = preOrderWalk(sheet, getNodesVisitor, FB_TYPES)
            .filter(isFormulaBearer)
        fbs.forEach((fb: Readonly<FormulaBearer>): void => {
            this._newExpr.add(fb.uuid)
        })
        this._calUpdateExprs(sheet.uuid)
        Array.from(this.exprManager.errorStorage.udfRef.keys()).forEach((
            uuid: string,
        ): void => {
            this._oldExpr.add(uuid)
        })
    }

    public removeSheetPayload(p: RemoveSheetPayload): void {
        const rdeps = this._getRemoveChildRdeps(p.name, this.exprManager)
        rdeps.forEach((uuid: string): void => {
            this._oldExpr.add(uuid)
        })
        Array.from(this.exprManager.errorStorage.udfRef.keys()).forEach((
            uuid: string,
        ): void => {
            this._oldExpr.add(uuid)
        })
    }

    public removeChildPayload(p: RemoveChildPayload): void {
        const rdeps = this._getRemoveChildRdeps(p.child, this.exprManager)
        rdeps.forEach((uuid: string): void => {
            this._oldExpr.add(uuid)
        })
        Array.from(this.exprManager.errorStorage.udfRef.keys()).forEach((
            uuid: string,
        ): void => {
            this._oldExpr.add(uuid)
        })
    }

    public updateRdepExprPayload(p: UpdateRdepExprPayload): void {
        this._newExpr.add(p.uuid)
    }

    // tslint:disable-next-line: prefer-function-over-method no-empty
    public setHeaderStubPayload(): void {}

    public undoPayload(p: UndoPayload): void {
        if (p.undoPlugin !== HistoryType.BOOK)
            return
        const last = this._history.undo()
        if (last === undefined)
            return
        this._undoRedo = true
        this._newExpr = last[0]
        this._oldExpr = last[1]
    }

    public redoPayload(p: RedoPayload): void {
        if (p.redoPlugin !== HistoryType.BOOK)
            return
        const last = this._history.redo()
        if (last === undefined)
            return
        this._undoRedo = true
        this._newExpr = last[0]
        this._oldExpr = last[1]
    }

    public initPayload(): void {
        this.exprManager = new ExprManager()
    }

    // tslint:disable-next-line: ext-variable-name naming-convention
    public setBookPayload(_: SetBookPayload): void {
        this._completeConvert = true
        preOrderWalk(this._book.book, getNodesVisitor, FB_TYPES).forEach(fb => {
            if (!isFormulaBearer(fb))
                return
            this._newExpr.add(fb.uuid)
        })
    }

    public renderPayload(): void {
        this._completeConvert = true
    }

    // tslint:disable-next-line: prefer-function-over-method no-empty
    public setSourceManagerPayload(): void {}
    private _completeConvert = false
    private _oldExpr = new Set<string>()
    private _newExpr = new Set<string>()
    private _history = new History()
    private _undoRedo = false

    private _handlePayloads(input: Readonly<Product>): void {
        const map = this._book.nodesMap
        this._completeConvert = false
        this._undoRedo = false
        this._newExpr = new Set<string>()
        this._oldExpr = new Set<string>()
        this.handlePayloads(input)
        if (this._completeConvert) {
            this.exprManager.convert(this._book.book)
            return
        }
        if (!this._undoRedo && input.changed.includes(PluginType.BOOK))
            this._history.add([this._newExpr, this._oldExpr])
        this._newExpr.forEach((uuid: string): void => {
            const fb = map.get(uuid)
            if (isFormulaBearer(fb))
                this.exprManager.updateExpr(fb)
        })
        this._oldExpr.forEach((uuid: string): void => {
            const fb = map.get(uuid)
            if (isFormulaBearer(fb))
                this.exprManager.updateExpr(fb, false)
        })
    }

    private _getRemoveChildRdeps(
        child: string,
        exprManager: ExprManager,
    ): readonly string[] {
        const info = this._book.removeChildInfo.get(child)
        if (info === undefined)
            return []
        const rdeps: string[] = [...info.fbs]
        info.fbs.forEach((r: string): void => {
            rdeps.push(...exprManager.depsStorage.getRdeps(r))
        })
        return rdeps
    }

    /**
     * Calculate all rdeps and the opposite fb nodes.
     */
    private _calUpdateExprs(uuid: string): void {
        const rdeps = getRdeps(uuid, this.exprManager, this._book.nodesMap)
        rdeps.forEach((u: string): void => {
            this._oldExpr.add(u)
        })
        const node = this._book.nodesMap.get(uuid)
        if (node === undefined)
            return
        const opposite = getOppositeNodes(node)
        opposite.forEach((u: string): void => {
            this._oldExpr.add(u)
        })
    }
}

function getRdeps(
    uuid: string,
    exprManager: ExprManager,
    map: Map<string, Readonly<Node>>,
): readonly string[] {
    const node = map.get(uuid)
    if (node === undefined)
        return []
    if (!(isFormulaBearer(node) || isColumnBlock(node) || isRowBlock(node))) {
        const res: string[] = []
        const targets = preOrderWalk(node, getNodesVisitor, FB_TYPES)
        targets.forEach((r: Readonly<Node>): void => {
            res.push(...exprManager.depsStorage.getRdeps(r.uuid))
        })
        return res
    }
    const rdeps: string[] = []
    const currType = isRow(node) || isRowBlock(node)
        ? [NodeType.ROW]
        : [NodeType.COLUMN]
    const curr = preOrderWalk(node, getNodesVisitor, currType)
    curr.forEach((n: Readonly<Node>): void => {
        rdeps.push(...exprManager.depsStorage.getRdeps(n.uuid))
    })
    const opposite = getOppositeNodes(node)
    opposite.forEach((u: string): void => {
        rdeps.push(...exprManager.depsStorage.getRdeps(u))
    })
    return rdeps
}

function getOppositeNodes(node: Readonly<Node>): readonly string[] {
    if (!(isFormulaBearer(node) || isColumnBlock(node) || isRowBlock(node)))
        return []
    const table = node.getTable()
    if (!isTable(table))
        return []
    const target = isRow(node) || isRowBlock(node)
        ? table.getLeafCols()
        : table.getLeafRows()
    return target.map(t => t.uuid)
}

export const EXPR_FORM = new FormBuilder()
    .type(PluginType.EXPR)
    .deps([PluginType.BOOK])
    .ctor(Plugin)
    .build()
