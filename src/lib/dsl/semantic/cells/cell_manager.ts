import {Op, OP_REGISTRY} from '@logi/src/lib/compute/op'
import {
    assertIsTable,
    Column,
    FormulaBearer,
    isRow,
    isTable,
    Row,
} from '@logi/src/lib/hierarchy/core'

import {Cell} from './cell'
import {CastFrom, CastFromBuilder, CellExpr, CellExprBuilder} from './cell_expr'

export interface CellStorage {
    getHighestCellExpr(row: string, col: string): CellExpr | undefined
    getCellExprs(row: string, col: string): readonly CellExpr[]
    getRowCellExpr(row: Readonly<Row>): readonly CellExpr[]
}

export class CellManager implements CellStorage {
    public getHighestCellExpr(row: string, col: string): CellExpr | undefined {
        const cellId = getCellId(row, col)
        const curr = this._cells.get(cellId)
        if (curr === undefined)
            return
        return curr.reduce((pre: CellExpr, next: CellExpr):
            CellExpr => pre.priority > next.priority ? pre : next)
    }

    public getCellExprs(row: string, col: string): readonly CellExpr[] {
        const cellId = getCellId(row, col)
        const curr = this._cells.get(cellId)
        if (curr === undefined)
            return []
        return curr
    }

    public getRowCellExpr(row: Readonly<Row>): readonly CellExpr[] {
        const table = row.getTable()
        assertIsTable(table)
        const colIds = table.getLeafCols().map((
            n: Readonly<Column>,
        ): string => n.uuid)
        const result: CellExpr[] = []
        colIds.forEach((col: string): void => {
            let cellExpr = this.getHighestCellExpr(row.uuid, col)
            if (cellExpr === undefined) {
                const cf = new CastFromBuilder().formulaBearer(row.uuid).build()
                cellExpr = getEmptyCellExpr(cf)
            }
            result.push(cellExpr)
        })
        return result
    }

    public setCells(fb: string, cells: readonly Cell[], slice?: string): void {
        cells.forEach((c: Cell): void => {
            const cellId = getCellId(c.row, c.column)
            const curr = this._cells.get(cellId)
            if (curr === undefined) {
                this._cells.set(cellId, [c.cellExpr])
                return
            }
            const existed = curr.findIndex((
                e: CellExpr,
            ): boolean => e.castFrom.formulaBearer === fb &&
                e.castFrom.sliceName === slice)
            if (existed < 0) {
                curr.push(c.cellExpr)
                return
            }
            curr.splice(existed, 1, c.cellExpr)
        })
    }

    public clearFb(fb: Readonly<FormulaBearer>): void {
        const table = fb.getTable()
        if (!isTable(table))
            return
        const header = table.getFbHeader(fb)
        header.forEach((h: Readonly<FormulaBearer>): void => {
            const cellId = isRow(fb)
                ? getCellId(fb.uuid, h.uuid)
                : getCellId(h.uuid, fb.uuid)
            const cells = this._cells.get(cellId)
            if (cells === undefined)
                return
            const newCells = cells.filter((cell: CellExpr): boolean =>
                cell.castFrom.formulaBearer !== fb.uuid)
            if (newCells.length === 0)
                this._cells.delete(cellId)
            else
                this._cells.set(cellId, newCells)
        })
    }

    // tslint:disable-next-line: readonly-array
    private _cells = new Map<string, CellExpr[]>()
}

function getCellId(row: string, col: string): string {
    return `${row}-${col}`
}

function getEmptyCellExpr(cf: CastFrom): CellExpr {
    const defaultName = 'empty'
    // tslint:disable-next-line: no-type-assertion
    const op = OP_REGISTRY.get(defaultName) as Op
    return new CellExprBuilder().op(op).castFrom(cf).build()
}
