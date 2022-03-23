import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {RowCntChanged, RowRepaint} from './row'
import {SheetDiff, SheetDiffType} from './sheet'
import {ValueDiff} from './source'
import {TableDiff} from './table'

export interface Diff {
    readonly rows: readonly RowRepaint[]
    readonly rowCntChanged: readonly RowCntChanged[]
    readonly sheets: readonly SheetDiff[]
    readonly values: readonly ValueDiff[]
    readonly tables: readonly TableDiff[]
    /**
     * Table uuid.
     */
    readonly removedTables: readonly string[]
    /**
     * Row uuid.
     */
    readonly removedRows: readonly string[]
    getRowDiff(sheetName: string): Map<string, readonly RowRepaint[]>
    getTableDiff(sheetName: string): readonly TableDiff[]
    getSheetDiff(sheet: string): SheetDiff | void
    getSheetAdd(): readonly (readonly [string, number])[]
    getValueDiff(sheetName: string): Set<string>
}

class DiffImpl implements Impl<Diff> {
    public rows: readonly RowRepaint[] = []
    public sheets: readonly SheetDiff[] = []
    public values: readonly ValueDiff[] = []
    public tables: readonly TableDiff[] = []
    public rowCntChanged: readonly RowCntChanged[] = []
    public removedTables: readonly string[] = []
    public removedRows: readonly string[] = []
    public getRowDiff(sheetName: string): Map<string, readonly RowRepaint[]> {
        const result = new Map<string, RowRepaint[]>()
        this.rows.forEach((rd: RowRepaint): void => {
            if (rd.sheetName !== sheetName)
                return
            const rows = result.get(rd.tableId) ?? []
            rows.push(rd)
            result.set(rd.tableId, rows)
        })
        return result
    }

    public getTableDiff(sheetName: string): readonly TableDiff[] {
        return this.tables
            .filter((t: TableDiff): boolean => t.sheetName === sheetName)
    }

    public getSheetDiff(sheet: string): SheetDiff | void {
        return this.sheets.find((s: SheetDiff): boolean => s.sheet === sheet)
    }

    public getValueDiff(sheetName: string): Set<string> {
        const result = new Set<string>()
        this.values.forEach((v: ValueDiff): void => {
            if (v.sheetName === sheetName)
                result.add(v.uuid)
        })
        return result
    }

    public getSheetAdd(): readonly (readonly [string, number])[] {
        const result: (readonly [string, number])[] = []
        this.sheets.forEach((s: SheetDiff): void => {
            if (s.type === SheetDiffType.ADD && s.name !== undefined &&
                s.idx !== undefined)
                result.push([s.name, s.idx])
        })
        return result
    }
}

export class DiffBuilder extends Builder<Diff, DiffImpl> {
    public constructor(obj?: Readonly<Diff>) {
        const impl = new DiffImpl()
        if (obj)
            DiffBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public rows(rows: readonly RowRepaint[]): this {
        this.getImpl().rows = rows
        return this
    }

    public sheets(sheets: readonly SheetDiff[]): this {
        this.getImpl().sheets = sheets
        return this
    }

    public values(values: readonly ValueDiff[]): this {
        this.getImpl().values = values
        return this
    }

    public tables(tables: readonly TableDiff[]): this {
        this.getImpl().tables = tables
        return this
    }

    public rowCntChanged(rm: readonly RowCntChanged[]): this {
        this.getImpl().rowCntChanged = rm
        return this
    }

    public removedTables(tables: readonly string[]): this {
        this.getImpl().removedTables = tables
        return this
    }

    public removedRows(rows: readonly string[]): this {
        this.getImpl().removedRows = rows
        return this
    }
}
