import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    getNodesVisitor,
    isSheet,
    isTable,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {
    DeltaType,
    Diff,
    DiffBuilder,
    RowCntChanged,
    RowCntChangedBuilder,
    RowRepaintBuilder,
    SheetDiff,
    SheetDiffBuilder,
    SheetDiffType,
    TableDiff,
    TableDiffBuilder,
} from '@logi/src/lib/hsf'

export class History {
    public undo(): Diff | void {
        const last = this._undoStack.pop()
        if (last === undefined)
            return
        this._redoStack.push(last)
        return last
    }

    public redo(): Diff | void {
        const last = this._redoStack.pop()
        if (last === undefined)
            return
        this._undoStack.push(last)
        return last
    }

    public canUndo(): boolean {
        return this._undoStack.length > 0
    }

    public canRedo(): boolean {
        return this._redoStack.length > 0
    }

    public add(diff: Diff): void {
        this._undoStack.push(diff)
        this._redoStack = []
    }
    // tslint:disable-next-line: readonly-array
    private _undoStack: Diff[] = []
    // tslint:disable-next-line: readonly-array
    private _redoStack: Diff[] = []
}

// tslint:disable-next-line: max-func-body-length
export function getUndoDiff(
    diff: Diff,
    bookMap: Map<string, Readonly<Node>>,
): Diff {
    const rows = [...diff.rows]
    diff.removedRows.forEach((uuid: string): void => {
        const r = bookMap.get(uuid)
        if (r === undefined)
            return
        const leafRows = preOrderWalk(r, getNodesVisitor, [NodeType.ROW])
        leafRows.forEach((n: Readonly<Node>): void => {
            const table = n.findParent(NodeType.TABLE)
            const sheet = n.findParent(NodeType.SHEET)
            if (!isTable(table) || !isSheet(sheet))
                return
            const repaint = new RowRepaintBuilder()
                .sheetName(sheet.name)
                .tableId(table.uuid)
                .row(n.uuid)
                .build()
            rows.push(repaint)
        })
    })
    const rm = diff.rowCntChanged.map((r: RowCntChanged): RowCntChanged => {
        let type: DeltaType | undefined
        if (r.type === DeltaType.ADD)
            type = DeltaType.REMOVE
        if (r.type === DeltaType.REMOVE)
            type = DeltaType.ADD
        if (type === undefined)
            return r
        return new RowCntChangedBuilder(r).type(type).build()
    })
    const sheets: SheetDiff[] = []
    diff.sheets.forEach((s: SheetDiff): void => {
        switch (s.type) {
        case SheetDiffType.REPAINT:
            sheets.push(s)
            break
        case SheetDiffType.ADD:
            const remove = new SheetDiffBuilder(s)
                .type(SheetDiffType.REMOVE)
                .build()
            sheets.push(remove)
            break
        case SheetDiffType.RENAME:
            sheets.push(new SheetDiffBuilder(s)
                .name(s.oldName ?? '')
                .oldName(s.name)
                .build())
            break
        case SheetDiffType.MOVE:
            sheets.push(new SheetDiffBuilder(s)
                .oriIdx(s.idx)
                .idx(s.oriIdx)
                .build())
            break
        case SheetDiffType.REMOVE:
            const add = new SheetDiffBuilder(s).type(SheetDiffType.ADD).build()
            sheets.push(add)
            break
        default:
        }
    })
    const tables: TableDiff[] = []
    diff.tables.forEach((t: TableDiff): void => {
        tables.push(new TableDiffBuilder(t)
            .colsRemoved(-t.colsRemoved)
            .headerRowsChanged(-t.headerRowsChanged)
            .build())
    })
    diff.removedTables.forEach((uuid: string): void => {
        const table = bookMap.get(uuid)
        if (!isTable(table))
            return
        const sheet = table.parent
        if (!isSheet(sheet))
            return
        const td = new TableDiffBuilder()
            .sheetName(sheet.name)
            .table(uuid)
            .build()
        tables.push(td)
    })
    const values = diff.values
    return new DiffBuilder()
        .rows(rows)
        .rowCntChanged(rm)
        .sheets(sheets)
        .values(values)
        .tables(tables)
        .build()
}
