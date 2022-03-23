import {Builder} from '@logi/base/ts/common/builder'
import {Address, AddressBuilder} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {
    BaseStyle,
    Cell,
    CellImpl,
    Comment,
    FormulaInfo,
    Hyperlink,
    StyleTag,
} from './cell'
import {TableData} from './table_data'
import {Value} from './value'

/**
 * Special cell for storing the data which is necessary for calculating.
 */
export interface DataCell extends Cell {
    readonly table: string
    /**
     * The uuid of the row where this cell is placed.
     */
    readonly row: string
    /**
     * The uuid of the column where this cell is placed.
     */
    readonly col: string
    getAddress(map: Map<string, TableData>): Address
}

class DataCellImpl extends CellImpl implements Impl<DataCell> {
    public table!: string
    public row!: string
    public col!: string
    public getAddress(tableMap: Map<string, TableData>): Address {
        const table = tableMap.get(this.table)
        if (table === undefined)
            return new AddressBuilder().row(-1).col(-1).sheetName('').build()
        const anchor = table.dataStart
        if (anchor === undefined)
            return new AddressBuilder().row(-1).col(-1).sheetName('').build()
        const relCol = table.leafCols.indexOf(this.col)
        const relRow = table.leafRows.indexOf(this.row)
        return new AddressBuilder()
            .col(relCol + anchor.col)
            .row(relRow + anchor.row)
            .sheetName(table.sheetName)
            .build()
    }
}

export class DataCellBuilder extends Builder<DataCell, DataCellImpl> {
    public constructor(obj?: Readonly<DataCell | Cell>) {
        const impl = new DataCellImpl()
        if (obj)
            DataCellBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public tags(style: readonly StyleTag[]): this {
        this.getImpl().tags = style
        return this
    }

    public baseStyle(style: BaseStyle): this {
        this.getImpl().baseStyle = style
        return this
    }

    public customFormula(customFormula: string): this {
        this.getImpl().customFormula = customFormula
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public formula(formula: FormulaInfo): this {
        this.getImpl().formula = formula
        return this
    }

    public table(table: string): this {
        this.getImpl().table = table
        return this
    }

    public value(value: Value): this {
        this.getImpl().value = value
        return this
    }

    public formattedText(value: string): this {
        this.getImpl().formattedText = value
        return this
    }

    public comment(value: Comment): this {
        this.getImpl().comment = value
        return this
    }

    public hyperlink(value: Hyperlink): this {
        this.getImpl().hyperlink = value
        return this
    }

    public preBuildHook(): void {
        this.getImpl().props = undefined
    }

    protected get daa(): readonly string[] {
        return DataCellBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'table',
    ]
}

export function isDataCell(value: unknown): value is DataCell {
    return value instanceof DataCellImpl
}

export function assertIsDataCell(value: unknown): asserts value is DataCell {
    if (!(value instanceof DataCellImpl))
        throw Error('Not a DataCell!')
}
