// tslint:disable: limit-indent-for-method-in-class
import {debugTimer} from '@logi/base/ts/common/debug'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    AddChildPayload,
    AddLabelPayload,
    AddSheetPayload,
    AddSlicePayload,
    HistoryType,
    isModifierPayload,
    isRedoPayload,
    isRemoveChildPayload,
    isRemoveSheetPayload,
    isSetActiveSheetPayload,
    isUndoPayload,
    ModifierPayload,
    MoveSheetPayload,
    Payload,
    RemoveChildPayload,
    RemoveLabelPayload,
    RemoveSheetPayload,
    RemoveSlicePayload,
    RenameSheetPayload,
    SetAliasPayload,
    SetDataTypePayload,
    SetExpressionPayload,
    SetHeaderStubPayload,
    SetNamePayload,
    SetSliceExprPayload,
    SetSliceNamePayload,
    SetSliceTypePayload,
    SetSourcePayload,
    SetTypePayload,
} from '@logi/src/lib/api/payloads'
import {ModifierPlugin} from '@logi/src/lib/api/plugins/modifier'
import {
    getNodesVisitor,
    isBook,
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isNode,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {
    BlockType,
    DeltaType,
    Diff,
    DiffBuilder,
    findBlock,
    getRowCount,
    HsfManager,
    RowCntChanged,
    RowCntChangedBuilder,
    RowRepaint,
    RowRepaintBuilder,
    SheetDiff,
    SheetDiffBuilder,
    SheetDiffType,
    TableDiff,
    TableDiffBuilder,
    ValueDiff,
    ValueDiffBuilder,
} from '@logi/src/lib/hsf'
import {ModelBuilder} from '@logi/src/lib/model'
import {Subject} from 'rxjs'

import {
    HsfInfo,
    HsfInfoBuilder,
    Plugin as Base,
    PluginType,
    Product,
} from '../base'
import {Plugin as BookPlugin} from '../book/plugin'
import {Plugin as ExprPlugin} from '../expr/plugin'
import {FormBuilder} from '../form'
import {Plugin as FormulaPlugin} from '../formula/plugin'
import {EditorHandler, HierarchyHandler, RenderHandler} from '../handler'
import {Plugin as SourcePlugin} from '../source/plugin'

import {History} from './history'
import {RenderResult} from './result'

export class Plugin extends Base<RenderResult>
    implements HierarchyHandler, EditorHandler, RenderHandler {
    public constructor(
        private readonly _book: BookPlugin,
        private readonly _formula: FormulaPlugin,
        private readonly _src: SourcePlugin,
        private readonly _expr: ExprPlugin,
        private readonly _modifier: ModifierPlugin,
    ) {
        super()
    }
    public type = PluginType.HSF
    public result$ = new Subject<RenderResult>()
    public hsfManager = new HsfManager()

    /**
     * Used in the latter plugin to generate the excel.
     */
    public hsfInfo?: HsfInfo
    // tslint:disable-next-line: max-func-body-length
    @debugTimer('hsf plugin')

    public handle(input: Readonly<Product>): void {
        this._init()
        const preHandlePayloads = input.payloads.filter(p =>
            isRemoveChildPayload(p) || isRemoveSheetPayload(p))
        this.handlePayloads(input, preHandlePayloads)
        const otherPayloads = input.payloads.filter((
            p: Payload,
        ) => !isRemoveChildPayload(p) && !isRemoveSheetPayload(p) &&
            !isIgnorePayload(p))
        if (preHandlePayloads.length === 0 && otherPayloads.length === 0)
            return
        const oldTableDepth = this.hsfManager.getHeaderDepth()
        const model = new ModelBuilder()
            .book(this._book.book)
            .sourceManager(this._src.sourceManager)
            .formulaManager(this._formula.formulaManager)
            .modifierManager(this._modifier.modifierManager)
            .build()
        this.hsfManager
            .render(model, this._expr.exprManager, this._book.nodesMap)
        const hsf = this.hsfManager.getHsf()
        const status = this.hsfManager.getStatus()
        const tableDepth = this.hsfManager.getHeaderDepth()
        if (hsf === undefined || status === undefined ||
            tableDepth === undefined)
            return
        this.handlePayloads(input, otherPayloads)
        this._handleModifier(input.payloads)
        if (this._ignore)
            return
        const infoBuilder = new HsfInfoBuilder().hsfBook(hsf).status(status)
        if (this._completeRender) {
            this.hsfInfo = infoBuilder.build()
            input.addChanged(this.type)
            return
        }
        let diff: Diff | void
        const undo = input.payloads.find(p =>
            isUndoPayload(p) && p.undoPlugin === HistoryType.HSF)
        const redo = input.payloads.find(p =>
            isRedoPayload(p) && p.redoPlugin === HistoryType.HSF)
        if (undo === undefined && redo === undefined)
            diff = this
                ._buildDiff(this._book.nodesMap, oldTableDepth, tableDepth)
        if (diff === undefined)
            return
        if (undo === undefined && redo === undefined) {
            this._history.add(diff)
            input.addChanged(this.type)
        }
        this.hsfInfo = infoBuilder.hsfDiff(diff).build()
        return
    }

    public renderPayload(): void {
        this._completeRender = true
        return
    }

    public loadCustomSheetsPayload(): void {
        this._completeRender = true
        return
    }

    // tslint:disable-next-line: prefer-function-over-method
    public setBookPayload(): void {
        return
    }

    // tslint:disable-next-line: prefer-function-over-method
    public setSourceManagerPayload(): void {
        return
    }

    // tslint:disable-next-line: prefer-function-over-method
    public initPayload(): void {
        return
    }

    public addSheetPayload(p: AddSheetPayload): void {
        const sheet = this._book.book.sheets.find((s => s.name === p.name))
        if (sheet === undefined)
            return
        const newSheet = new SheetDiffBuilder()
            .name(p.name)
            .idx(p.position)
            .sheet(sheet.uuid)
            .type(SheetDiffType.ADD)
            .build()
        this._sheetDiff.push(newSheet)
        this._sheets.add(sheet.uuid)
    }

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public addChildPayload(p: AddChildPayload): void {
        const node = this._book.nodesMap.get(p.child.uuid)
        if (node === undefined)
            return
        const sheet = node.findParent(NodeType.SHEET)
        if (!isSheet(sheet))
            return
        if (isColumn(p.child) || isColumnBlock(p.child)) {
            this._handleFbChangedPayload(p.child.uuid)
            const cols = preOrderWalk(
                p.child,
                getNodesVisitor,
                [NodeType.COLUMN],
            )
            const cnt = this._tableColsRemoved.get(p.uuid) ?? 0
            this._tableColsRemoved.set(p.uuid, cnt - cols.length)
            return
        }
        const hsf = this.hsfManager.getHsf()
        if (hsf === undefined)
            return
        const addBlockPos = findBlock(hsf, p.child.uuid)
        if (addBlockPos === undefined) {
            // Here means that some hierarchy node is not transipiled to hsf.
            // Handling ending title will come here.
            // TODO: throw error here.
            this._ignore = true
            return
        }
        const sheetName = addBlockPos.sheetName
        if (isRow(p.child)) {
            if (this._hasAddedRows.has(p.child.uuid))
                return
            this._handleFbChangedPayload(p.child.uuid)
            const add = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(addBlockPos.startRow)
                .col(addBlockPos.startCol)
                .cnt(1)
                .type(DeltaType.ADD)
                .build()
            this._rowCntChanged.push(add)
            this._rows.add(p.child.uuid)
            return
        }
        if (isRowBlock(p.child)) {
            this._handleFbChangedPayload(p.child.uuid)
            const table = addBlockPos.table
            const blocks = table.getBlocks()
            const curr = blocks[addBlockPos.idx]
            let left = curr.childrenCount
            let cnt = 0
            let idx = addBlockPos.idx
            while (left > 0 && idx < blocks.length) {
                left -= 1
                idx += 1
                const b = blocks[idx]
                if (b.type === BlockType.ROW_BLOCK) {
                    left += b.childrenCount
                    return
                }
                if (b.type !== BlockType.ROW || this._hasAddedRows.has(b.uuid))
                    return
                cnt += b.area.row
                this._rows.add(b.uuid)
                this._hasAddedRows.add(b.uuid)
            }
            const result = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(addBlockPos.startRow)
                .col(addBlockPos.startCol)
                .cnt(cnt)
                .type(DeltaType.ADD)
                .build()
            this._rowCntChanged.push(result)
            return
        }
        if (isTable(p.child)) {
            const cnt = getRowCount(addBlockPos.table.getBlocks())
            const rowRemoved = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(addBlockPos.table.data.renderStart?.row ?? 0)
                .col(addBlockPos.table.data.renderStart?.col ?? 0)
                .type(DeltaType.ADD)
                .cnt(cnt)
                .build()
            this._rowCntChanged.push(rowRemoved)
            this._tables.add(p.child.uuid)
            return
        }
        if (isTitle(p.child)) {
            const parent = p.child.parent
            // tslint:disable-next-line: no-magic-numbers
            const cnt = isTitle(parent) ? 1 : 2
            const rm = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(addBlockPos.startRow)
                .col(addBlockPos.startCol)
                .cnt(cnt)
                .type(DeltaType.ADD)
                .build()
            this._rowCntChanged.push(rm)
            this._values.add(p.child.uuid)
        }
        return
    }

    public moveSheetPayload(p: MoveSheetPayload): void {
        const sheet = this._book.book.sheets.find(s => s.name === p.name)
        if (sheet === undefined)
            return
        this._sheetDiff.push(new SheetDiffBuilder()
            .name(sheet.name)
            .sheet(sheet.uuid)
            .idx(p.position)
            .oriIdx(p.oriPos)
            .type(SheetDiffType.MOVE)
            .build())
    }

    public removeSheetPayload(p: RemoveSheetPayload): void {
        const lastHsf = this.hsfManager.getHsf()
        if (lastHsf === undefined) {
            this._completeRender = true
            return
        }
        const sheet = lastHsf.sheets.find(s => s.name === p.name)
        if (sheet === undefined)
            return
        const remove = new SheetDiffBuilder()
            .sheet(sheet.uuid)
            .name(sheet.name)
            .idx(p.index)
            .type(SheetDiffType.REMOVE)
            .build()
        this._sheetDiff.push(remove)
        const changed = this._expr.changedFormulas
        changed.forEach((s: string): void => {
            const fb = this._book.nodesMap.get(s)
            if (!isFormulaBearer(fb))
                return
            if (isRow(fb)) {
                this._rows.add(s)
                return
            }
            const t = fb.getTable()
            if (t === undefined)
                return
            this._tables.add(t.uuid)
        })
    }

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public removeChildPayload(p: RemoveChildPayload): void {
        const lastHsf = this.hsfManager.getHsf()
        if (lastHsf === undefined) {
            this._completeRender = true
            return
        }
        const info = this._book.removeChildInfo.get(p.child)
        if (info === undefined)
            return
        if (info.type === NodeType.SHEET)
            return
        const rmBlockPos = findBlock(lastHsf, p.child)
        if (rmBlockPos === undefined) {
            // Here means that some hierarchy node is not transipiled to hsf.
            // Handling ending title will come here.
            this._ignore = true
            return
        }
        const sheetName = rmBlockPos.sheetName
        // tslint:disable-next-line: prefer-switch
        if (info.type === NodeType.TABLE) {
            const cnt = getRowCount(rmBlockPos.table.getBlocks())
            const rowRemoved = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(rmBlockPos.table.data.renderStart?.row ?? 0)
                .col(rmBlockPos.table.data.renderStart?.col ?? 0)
                .cnt(cnt)
                .build()
            this._rowCntChanged.push(rowRemoved)
            this._removedTables.push(p.child)
        } else if (info.type === NodeType.ROW) {
            const rm = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(rmBlockPos.startRow)
                .col(rmBlockPos.startCol)
                .cnt(1)
                .build()
            this._rowCntChanged.push(rm)
            this._removedRows.push(p.child)
        } else if (info.type === NodeType.ROW_BLOCK) {
            const table = rmBlockPos.table
            const blocks = table.getBlocks()
            const curr = table.getBlocks()[rmBlockPos.idx]
            let left = curr.childrenCount
            let cnt = 0
            let idx = rmBlockPos.idx
            while (left > 0 && idx < blocks.length) {
                left -= 1
                idx += 1
                const b = blocks[idx]
                if (b.type === BlockType.ROW_BLOCK) {
                    left += b.childrenCount
                    return
                }
                if (b.type !== BlockType.ROW ||
                    this._removedRows.includes(b.uuid))
                    return
                cnt += b.area.row
                this._removedRows.push(b.uuid)
            }
            const result = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(rmBlockPos.startRow)
                .col(rmBlockPos.startCol)
                .cnt(cnt)
                .build()
            this._rowCntChanged.push(result)
        } else if (info.type === NodeType.TITLE) {
            const rm = new RowCntChangedBuilder()
                .sheetName(sheetName)
                .row(rmBlockPos.startRow)
                .col(rmBlockPos.startCol)
                .cnt(1)
                .build()
            this._rowCntChanged.push(rm)
        } else if (info.type === NodeType.COLUMN) {
            this._tables.add(rmBlockPos.table.stub.uuid)
            const tableId = rmBlockPos.table.stub.uuid
            const cnt = this._tableColsRemoved.get(tableId) ?? 0
            this._tableColsRemoved.set(tableId, cnt + 1)
        } else if (info.type === NodeType.COLUMN_BLOCK) {
            const table = rmBlockPos.table
            const blocks = table.getBlocks()
            const curr = blocks[rmBlockPos.idx]
            let left = curr.childrenCount
            let cnt = this._tableColsRemoved.get(table.stub.uuid) ?? 0
            let idx = rmBlockPos.idx + 1
            while (left > 0 && idx < blocks.length) {
                if (blocks[idx].type === BlockType.COLUMN) {
                    left -= 1
                    cnt += blocks[idx].area.col
                } else if (blocks[idx].type === BlockType.COLUMN_BLOCK)
                    left += blocks[idx].childrenCount
                idx += 1
            }
            this._tables.add(rmBlockPos.table.stub.uuid)
            this._tableColsRemoved.set(table.stub.uuid, cnt)
        }
        const changed = this._expr.changedFormulas
        changed.forEach((s: string): void => {
            const fb = this._book.nodesMap.get(s)
            if (!isFormulaBearer(fb))
                return
            if (isRow(fb)) {
                this._rows.add(s)
                return
            }
            const t = fb.getTable()
            if (t === undefined)
                return
            if ((info.type === NodeType.ROW || info.type === NodeType.ROW_BLOCK)
                && t.uuid === rmBlockPos.table.stub.uuid)
                return
            this._tables.add(t.uuid)
        })
        return
    }

    public setExpressionPayload(p: SetExpressionPayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public setSliceExprPayload(p: SetSliceExprPayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public setNamePayload(p: SetNamePayload): void {
        const node = this._book.nodesMap.get(p.uuid)
        if (node === undefined)
            return
        if (isBook(node))
            return
        if (isTable(node))
            this._values.add(`${p.uuid}-name`)
        else if (isRow(node))
            this._rows.add(p.uuid)
        else if (!isSheet(node))
            this._values.add(p.uuid)
        this._handleFbChangedPayload(p.uuid)
        return
    }

    public renameSheetPayload(p: RenameSheetPayload): void {
        const sheet = this._book.book.sheets.find(s => s.name === p.name)
        if (sheet === undefined)
            return
        this._sheetDiff.push(new SheetDiffBuilder()
            .sheet(sheet.uuid)
            .name(p.name)
            .oldName(p.oldName)
            .type(SheetDiffType.RENAME)
            .build())
    }

    public setAliasPayload(p: SetAliasPayload): void {
        this._handleFbChangedPayload(p.uuid)
    }

    public setHeaderStubPayload(p: SetHeaderStubPayload): void {
        const node = this._book.nodesMap.get(p.uuid)
        if (node === undefined)
            return
        this._values.add(p.uuid)
        return
    }

    public setSourcePayload(p: SetSourcePayload): void {
        this._rows.add(p.row)
        return
    }

    public setDataTypePayload(p: SetDataTypePayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public removeSlicePayload(p: RemoveSlicePayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public setTypePayload(p: SetTypePayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public setSliceTypePayload(p: SetSliceTypePayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public removeLabelPayload(p: RemoveLabelPayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public setSliceNamePayload(p: SetSliceNamePayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public addLabelPayload(p: AddLabelPayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    public addSlicePayload(p: AddSlicePayload): void {
        return this._handleFbChangedPayload(p.uuid)
    }

    /**
     * Used to record the table diff.
     */
    private _tables = new Set<string>()
    private _tableColsRemoved = new Map<string, number>()
    private _rows = new Set<string>()
    private _sheets = new Set<string>()
    private _values = new Set<string>()
    private _hasAddedRows = new Set<string>()
    // tslint:disable-next-line: readonly-array
    private _sheetDiff: SheetDiff[] = []

    private _completeRender = false
    private _ignore = false

    // tslint:disable-next-line: readonly-array
    private _rowCntChanged: RowCntChanged[] = []
    // tslint:disable-next-line: readonly-array
    private _removedTables: string[] = []
    // tslint:disable-next-line: readonly-array
    private _removedRows: string[] = []

    private _history = new History()

    private _buildDiff(
        map: Map<string, Readonly<Node>>,
        oldDepthMap: Map<string, number> | undefined,
        newDepthMap: Map<string, number>,
    ): Diff | void {
        if (this._values.size === 0 &&
            this._sheets.size === 0 &&
            this._rows.size === 0 &&
            this._tables.size === 0 &&
            this._rowCntChanged.length === 0 &&
            this._sheetDiff.length === 0)
            return
        const valuesDiff: ValueDiff[] = []
        this._values.forEach((s: string): void => {
            const vd = buildValueDiff(s, map)
            if (vd !== undefined)
                valuesDiff.push(vd)
        })
        this._sheets.forEach((s: string): void => {
            const sd = buildSheetDiff(s, map)
            if (sd !== undefined)
                this._sheetDiff.push(sd)
        })
        const rowDiff: RowRepaint[] = []
        this._rows.forEach((s: string) => {
            if (s === undefined)
                return
            const rd = buildRowDiff(s, map)
            if (rd !== undefined)
                rowDiff.push(rd)
        })
        const tableDiff: TableDiff[] = []
        this._tables.forEach((k: string): void => {
            const cnt = this._tableColsRemoved.get(k) ?? 0
            const newDepth = newDepthMap.get(k)
            const oldDepth = oldDepthMap?.get(k)
            const delta = newDepth === undefined || oldDepth === undefined ?
                0 : newDepth - oldDepth
            const td = buildTableDiff(k, map, cnt, delta)
            if (td !== undefined)
                tableDiff.push(td)
        })
        return new DiffBuilder()
            .rows(rowDiff)
            .sheets(this._sheetDiff)
            .values(valuesDiff)
            .rowCntChanged(this._rowCntChanged)
            .tables(tableDiff)
            .removedTables(this._removedTables)
            .removedRows(this._removedRows)
            .build()
    }

    private _init(): void {
        this.hsfInfo = undefined
        this._tables = new Set<string>()
        this._rowCntChanged = []
        this._tableColsRemoved = new Map<string, number>()
        this._ignore = false
        this._rows = new Set<string>()
        this._sheets = new Set<string>()
        this._values = new Set<string>()
        this._completeRender = false
        this._sheetDiff = []
        this._hasAddedRows = new Set<string>()
        this._removedTables = []
        this._removedRows = []
    }

    private _handleFbChangedPayload(uuid: string): void {
        const node = this._book.nodesMap.get(uuid)
        const changed = [...this._expr.changedFormulas, uuid]
        changed.forEach((s: string): void => {
            const fb = this._book.nodesMap.get(s)
            if (!isFormulaBearer(fb))
                return
            if (isRow(fb)) {
                this._rows.add(s)
                return
            }
            const t = fb.getTable()
            if (t === undefined)
                return
            if ((isRow(node) || isRowBlock(node)) &&
                node.getTable()?.uuid === t.uuid)
                return
            this._tables.add(t.uuid)
        })
        return
    }

    private _handleModifier(payloads: readonly Payload[]): void {
        const modifier = payloads.filter(isModifierPayload)
        modifier.forEach((p: ModifierPayload): void => {
            this._rows.add(p.row)
        })
    }
}

export const HSF_FORM = new FormBuilder()
    .type(PluginType.HSF)
    .deps([
        PluginType.BOOK,
        PluginType.FORMULA,
        PluginType.SOURCE,
        PluginType.EXPR,
        PluginType.MODIFIER,
    ])
    .ctor(Plugin)
    .build()

function buildValueDiff(
    uuid: string,
    map: Map<string, Readonly<Node>>,
): ValueDiff | undefined {
    // tslint:disable-next-line: no-magic-numbers
    const node = map.get(uuid) ?? map.get(uuid.slice(0, uuid.length - 5))
    if (!isNode(node))
        return
    const s = node.findParent(NodeType.SHEET)
    return !isSheet(s)
        ? undefined
        : new ValueDiffBuilder().sheetName(s.name).uuid(uuid).build()
}

function buildRowDiff(
    rowId: string,
    map: Map<string, Readonly<Node>>,
): RowRepaint | undefined {
    const node = map.get(rowId)
    if (!isRow(node) && !isRowBlock(node))
        return
    const t = node.getTable()
    if (!isTable(t))
        return
    const sheet = t.findParent(NodeType.SHEET)
    if (!isSheet(sheet))
        return
    return new RowRepaintBuilder()
        .row(rowId)
        .sheetName(sheet.name)
        .tableId(t.uuid)
        .build()
}

function buildTableDiff(
    // tslint:disable-next-line: max-params
    tableId: string,
    map: Map<string, Readonly<Node>>,
    colsRemoved: number,
    hDelta: number,
): TableDiff | undefined {
    const node = map.get(tableId)
    if (!isTable(node))
        return
    const sheet = node.findParent(NodeType.SHEET)
    if (!isSheet(sheet))
        return
    return new TableDiffBuilder()
        .sheetName(sheet.name)
        .table(node.uuid)
        .colsRemoved(colsRemoved)
        .headerRowsChanged(hDelta)
        .build()
}

function isIgnorePayload(p: Payload): boolean {
    return isSetActiveSheetPayload(p)
}

function buildSheetDiff(
    sheetId: string,
    map: Map<string, Readonly<Node>>,
): SheetDiff | undefined {
    const node = map.get(sheetId)
    if (!isSheet(node))
        return
    return new SheetDiffBuilder()
        .sheet(node.uuid)
        .name(node.name)
        .type(SheetDiffType.REPAINT)
        .build()
// tslint:disable-next-line: max-file-line-count
}
