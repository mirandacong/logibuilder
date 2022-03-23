import {
    ColumnPositionType,
    DataCell,
    TableData as HsfTableData,
} from '@logi/src/lib/hsf/defs'

/**
 * The status of hsf book.
 * Help us to get the nodes information quickly and easily.
 */
export class Status {
    public addTableData(id: string, table: HsfTableData): void {
        this._tableMap.set(id, table)
    }

    public addDataCell(id: string, cell: DataCell): void {
        this._cellMap.set(id, cell)
    }

    public addSheetWidth(id: string, width: number): void {
        this._widthMap.set(id, width)
    }

    public addColumnType(id: string, type: ColumnPositionType): void {
        this._columnTypeMap.set(id, type)
    }

    public getTableData(id: string): HsfTableData | undefined {
        return this._tableMap.get(id)
    }

    public getSheetWidth(id: string): number | undefined {
        return this._widthMap.get(id)
    }

    public getDataCell(id: string): DataCell | undefined {
        return this._cellMap.get(id)
    }

    public getColumnType(id: string): ColumnPositionType | undefined {
        return this._columnTypeMap.get(id)
    }

    public getTableDataMap(): Map<string, HsfTableData> {
        return this._tableMap
    }

    public addRowCnt(uuid: string, rowCnt: number): void {
        this._rowCntMap.set(uuid, rowCnt)
        return
    }

    public getRowCnt(uuid: string): number | undefined {
        return this._rowCntMap.get(uuid)
    }

    private _tableMap = new Map<string, HsfTableData>()
    private _cellMap = new Map<string, DataCell>()
    private _columnTypeMap = new Map<string, ColumnPositionType>()
    // Given the uuid of the sheet and find the width of the columns in this
    // sheet.
    private _widthMap = new Map<string, number>()
    /**
     * Given a node, find out the row count of this hierarchy node in the excel.
     */
    private _rowCntMap = new Map<string, number>()
}
