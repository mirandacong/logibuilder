// tslint:disable: limit-indent-for-method-in-class
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Address, AddressBuilder} from '@logi/base/ts/common/excel'
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'

import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {Node} from '@logi/src/lib/hierarchy/core'
import {Model} from '@logi/src/lib/model'
import {Cursor} from './cursor'
import {
    Block,
    BlockType,
    Book as HsfBook,
    DataCell,
    isRow as isHsfRow,
    Sheet as HsfSheet,
    Table as HsfTable,
} from './defs'
import {getCellId, VizData, VizDataBuilder} from './lib'
import {render} from './renderer'
import {Status} from './status'
import {transpile} from './transpiler'

/**
 * Visit or update the hsf book.
 */
export class HsfManager {
    public hasBeenRendered(): boolean {
        return this._status !== undefined && this._hsf !== undefined
    }

    /**
     * Render a whole book.
     */
    public render(
        model: Model,
        exprManager: ExprManager,
        bookMap: Map<string, Readonly<Node>>,
    ): HsfBook {
        const transipileResult = transpile(model)
        const renderResult = render(
            transipileResult[0],
            bookMap,
            model,
            exprManager,
        )
        this._headerDepth = transipileResult[1]
        this._status = renderResult[1]
        this._hsf = renderResult[0]
        return renderResult[0]
    }

    public getHsf(): HsfBook | undefined {
        return this._hsf
    }

    public getStatus(): Status | void {
        return this._status
    }

    public getHeaderDepth(): Map<string, number> | undefined {
        return this._headerDepth
    }

    public getVizData(
        row: string,
        col: string,
        excel: GC.Spread.Sheets.Workbook,
    ): VizData | Exception {
        const addr = this.getCellAddress(row, col)
        if (isException(addr))
            return addr
        const sheet = excel.getSheetFromName(addr.sheetName)
        const formula = sheet.getFormula(addr.row, addr.col) ?? ''
        const value = sheet.getValue(addr.row, addr.col)
        return new VizDataBuilder()
            .row(addr.row)
            .col(addr.col)
            .formula(formula)
            .address(addr)
            .value(typeof value === 'number' ? value.toString() : value)
            .build()
    }

    public getCellAddress(row: string, col: string): Address | Exception {
        if (this._status === undefined)
            return new ExceptionBuilder().message('Hsf is empty.').build()
        const cellId = getCellId(row, col)
        const cell = this._status.getDataCell(cellId)
        if (cell === undefined)
            return new ExceptionBuilder()
                .message('Can not find this cell')
                .build()
        const map = this._status.getTableDataMap()
        return cell.getAddress(map)
    }

    public getNodeAddress(
        sheetName: string,
        node: string,
    ): Address | Exception | undefined {
        if (this._hsf === undefined)
            return new ExceptionBuilder().message('Hsf is empty.').build()
        const hsfSheet = this._hsf.sheets.find((
            s: HsfSheet,
        ): s is HsfSheet => s.name === sheetName)
        if (hsfSheet === undefined)
            return new ExceptionBuilder()
                .message(`Sheet:${sheetName} is not found.`)
                .build()
        const cursor = new Cursor(0, 0)
        cursor.arrive(hsfSheet.margin)
        for (const t of hsfSheet.data)
            for (const b of t.getBlocks()) {
                if (b.uuid === node)
                    return cursor.getAddress(b)[0]
                cursor.arrive(b)
            }
        return
    }

    /**
     * Get a hierarchy uuid by the cell coordinates.
     * When selecting a data cell:
     *      If `allowDataCell` is true, return the row uuid.
     *      Otherwise, return undefined.
     */
    public getNode(
        // tslint:disable-next-line: max-params
        sheetName: string,
        cellRow: number,
        cellCol: number,
        allowDataCell = true,
    ): string | undefined {
        if (this._hsf === undefined)
            return
        const hsfSheet = this._hsf.sheets.find((
            s: HsfSheet,
        ): s is HsfSheet => s.name === sheetName)
        if (hsfSheet === undefined)
            return
        const cursor = new Cursor(0, 0)
        cursor.arrive(hsfSheet.margin)
        for (const t of hsfSheet.data)
            for (const b of t.getBlocks()) {
                if (cursor.getRow() === cellRow && b.type === BlockType.ROW &&
                    allowDataCell)
                    return b.uuid
                if (cursor.getRow() === cellRow
                    && b.type !== BlockType.ROW_BLOCK
                    && cursor.getCol() === cellCol)
                    return b.uuid
                cursor.arrive(b)
            }
        return
    }

    public getCell(
        sheetName: string,
        cellRow: number,
        cellCol: number,
    ): readonly [string, string] | Exception {
        if (this._hsf === undefined)
            return new ExceptionBuilder().message('Hsf is empty.').build()
        const hsfSheet = this._hsf.sheets.find((
            s: HsfSheet,
        ): s is HsfSheet => s.name === sheetName)
        if (hsfSheet === undefined)
            return new ExceptionBuilder()
                .message(`Sheet:${sheetName} is not found.`)
                .build()
        const cursor = new Cursor(0, 0)
        cursor.arrive(hsfSheet.margin)
        let table!: HsfTable
        for (const t of hsfSheet.data) {
            table = t
            for (const b of table.getBlocks()) {
                if (cursor.getRow() !== cellRow || !isHsfRow(b)) {
                    cursor.arrive(b)
                    continue
                }
                const currCol = cursor.getCol()
                const colIdx = cellCol - currCol - 1
                if (colIdx >= table.data.leafCols.length || colIdx < 0)
                    return new ExceptionBuilder()
                        .message('Not table cell.')
                        .build()
                const colId = table.data.leafCols[colIdx]
                return [b.uuid, colId]
            }
        }
        return new ExceptionBuilder().message('Not a row.').build()
    }

    /**
     * Find the data cells and return their address.
     */
    public findDataCells(
        sheetName: string,
        filter: (dc: DataCell) => boolean,
    ): readonly (readonly [DataCell, Address])[] {
        if (!this.hasBeenRendered())
            return []
        const sheet = this._hsf?.sheets.find((
            s: HsfSheet,
        ): boolean => s.name === sheetName)
        if (sheet === undefined)
            return []
        const cursor = new Cursor(0, 0)
        cursor.arrive(sheet.margin)
        const result: [DataCell, Address][] = []
        sheet.data.forEach((t: HsfTable): void => {
            t.getBlocks().forEach((b: Block): void => {
                if (!isHsfRow(b)) {
                    cursor.arrive(b)
                    return
                }
                b.dataCells.forEach((dc: DataCell, idx: number): void => {
                    if (!filter(dc))
                        return
                    const addr = new AddressBuilder()
                        .row(cursor.getRow())
                        .col(cursor.getCol() + idx + 1)
                        .build()
                    result.push([dc, addr])
                })
                cursor.arrive(b)
            })
        })
        return result
    }

    public setInvalid(): void {
        this._status = undefined
        this._hsf = undefined
    }

    private _status: Status | undefined

    private _hsf: HsfBook | undefined
    private _headerDepth: Map<string, number> | undefined
}
