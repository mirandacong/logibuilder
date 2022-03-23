// tslint:disable: limit-indent-for-method-in-class
import {AddressBuilder} from '@logi/base/ts/common/excel'
import {Writable} from '@logi/base/ts/common/mapped_types'
import {CellExpr, ExprManager} from '@logi/src/lib/dsl/semantic'
import {FormulaManager} from '@logi/src/lib/formula'
import {
    Column,
    isRow,
    isRowBlock,
    isTable,
    Node,
    Row,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {Model} from '@logi/src/lib/model'
import {SourceManager, SourceType} from '@logi/src/lib/source'

import {Cursor} from './cursor'
import {
    BaseStyle,
    Block,
    BlockBuilder,
    BlockType,
    Book as HsfBook,
    BookBuilder as HsfBookBuilder,
    Cell as HsfCell,
    CellBuilder,
    Column as HsfColumn,
    ColumnBuilder as HsfColumnBuilder,
    ColumnPositionType,
    DataCell,
    DataCellBuilder,
    FormulaInfoBuilder,
    isColumn as isHsfColumn,
    isRow as isHsfRow,
    isTitle as isHsfTitle,
    Row as HsfRow,
    RowBuilder as HsfRowBuilder,
    Sheet as HsfSheet,
    SheetBuilder as HsfSheetBuilder,
    StyleTag,
    Table as HsfTable,
    TableBuilder as HsfTableBuilder,
    TableDataBuilder,
    Title as HsfTitle,
    TitleBuilder as HsfTitleBuilder,
    ValueBuilder as CellValueBuilder,
    ValueSourceType,
} from './defs'
import {getCellId, getColumnPosTag, getRowCount} from './lib'
import {Status} from './status'

export function render(
    // tslint:disable-next-line: max-params
    hsf: HsfBook,
    map: Map<string, Readonly<Node>>,
    model: Readonly<Model>,
    exprManager: ExprManager,
): readonly [HsfBook, Status] {
    const renderer = new Renderer(
        map,
        model.sourceManager,
        model.formulaManager,
        exprManager,
    )
    return renderer.render(hsf)
}

/**
 * In this procedure, hsf book is built completely. We set all style
 * information and formulas.
 */
class Renderer {
    public constructor(
        private readonly _map: Map<string, Readonly<Node>>,
        private readonly _sourceManager: SourceManager,
        private readonly _formulaManager: FormulaManager,
        private readonly _exprManager: ExprManager,
    ) {
        this._initCursor()
    }

    public render(hsf: Readonly<HsfBook>): readonly [HsfBook, Status] {
        const sheets: HsfSheet[] = []
        hsf.sheets.forEach((hsfSheet: HsfSheet): void => {
            const sheet = this._renderSheet(hsfSheet)
            sheets.push(sheet)
            this._initCursor()
        })
        return [new HsfBookBuilder(hsf).sheets(sheets).build(), this._status]
    }

    private _cursor!: Cursor

    private _status = new Status()

    /**
     * This is used at:
     * - If a row whose isDefScalar is true, its first data cell would have a
     * borders. If the last row has isDefScalar too, the top border of this
     * cell(the bottom border of its up cell) should be empty. We use this
     * property to find if the last row is defscalar.
     * - When we meet a block whose type is ROWBLOCK, it means that the last row
     * we met should render different if it shares the same name with this
     * block. We use a property to record the last hsf row.
     */
    private _lastRow!: HsfRow

    private _initCursor(): void {
        this._cursor = new Cursor(0, 0)
    }

    private _renderSheet(sheet: HsfSheet): HsfSheet {
        const tables: HsfTable[] = []
        this._cursor.arrive(sheet.margin)
        sheet.data.forEach((table: HsfTable): void => {
            tables.push(this._renderTable(table))
            const blocks = table.getBlocks()
            blocks.forEach((b: Block): void => {
                this._cursor.arrive(b)
            })
        })
        return new HsfSheetBuilder(sheet).data(tables).build()
    }

    private _renderTable(t: HsfTable): HsfTable {
        const rowOffset = getRowCount([...t.titles, t.name, t.stub])
        const renderStart = new AddressBuilder()
            .row(this._cursor.getRow())
            .col(this._cursor.getCol())
            .build()
        const dataStart = new AddressBuilder()
            .row(rowOffset + this._cursor.getRow())
            .col(this._cursor.getCol() + 1)
            .build()
        const data = new TableDataBuilder(t.data)
            .renderStart(renderStart)
            .dataStart(dataStart)
            .build()
        this._status.addTableData(t.stub.uuid, data)
        this._status.addRowCnt(t.stub.uuid, getRowCount(t.getBlocks()))
        // Order belows matters!
        const titles = t.titles.map(this._renderBlock.bind(this))
        const cols = t.cols.map(this._renderBlock.bind(this))
        const rows = t.rows.map(this._renderBlock.bind(this))
        const end = this._renderBlock(t.end)
        const stub = this._renderBlock(t.stub)
        const name = this._renderBlock(t.name)
        return new HsfTableBuilder(t)
            .data(data)
            .titles(titles)
            .rows(rows)
            .cols(cols)
            .end(end)
            .stub(stub)
            .name(name)
            .build()
    }

    private _renderBlock(block: Block): Block {
        switch (block.type) {
        case BlockType.TABLE:
            return this._renderStub(block)
        case BlockType.TABLE_NAME:
            return this._renderTableName(block)
        case BlockType.TITLE:
            return isHsfTitle(block)
                ? this._renderTitle(block)
                : block
        case BlockType.ROW_BLOCK:
            return this._renderRowBlock(block)
        case BlockType.ROW:
            return isHsfRow(block)
                ? this._renderRow(block)
                : block
        case BlockType.COLUMN_BLOCK:
            return this._renderColumnBlock(block)
        case BlockType.HEADER_INTERVAL:
            return this._renderHeaderInterval(block)
        case BlockType.COLUMN:
            return isHsfColumn(block)
                ? this._renderColumn(block)
                : block
        case BlockType.TABLE_END:
            return this._renderTableEnd(block)
        default:
            return block
        }
    }

    private _renderRowBlock(block: Block): Block {
        const rb = this._map.get(block.uuid)
        if (!isRowBlock(rb))
            return block
        const lastValue = this._lastRow?.nameCell.value
        if (lastValue === undefined)
            return block
        const lastName = lastValue.text
        if (lastName === undefined)
            return block
        // tslint:disable-next-line: no-type-assertion
        const lastNameCell = this._lastRow.nameCell as Writable<HsfCell>
        lastNameCell.baseStyle = BaseStyle.ROW_BLOCK
        return block
    }

    private _renderStub(block: Block): Block {
        const node = this._map.get(block.uuid)
        if (!isTable(node))
            return block
        const value = new CellValueBuilder().text(node.headerStub).build()
        const cell = new CellBuilder()
            .value(value)
            .baseStyle(BaseStyle.TABLE_STUB)
            .build()
        return new BlockBuilder(block).cells([cell]).build()
    }

    private _renderTitle(block: HsfTitle): HsfTitle {
        const node = this._map.get(block.uuid)
        if (node === undefined)
            return block
        const value = new CellValueBuilder().text(node.name).build()
        const cell = new CellBuilder()
            .value(value)
            .baseStyle(BaseStyle.SHEET_TITLE)
            .build()
        return new HsfTitleBuilder(block).cells([cell]).build()
    }

    private _renderTableName(block: Block): Block {
        const suffix = '-name'
        const uuid = block.uuid.slice(0, block.uuid.length - suffix.length)
        const node = this._map.get(uuid)
        if (node === undefined)
            return block
        const value = new CellValueBuilder().text(node.name).build()
        const cell = new CellBuilder()
            .value(value)
            .baseStyle(BaseStyle.SHEET_TITLE)
            .build()
        return new BlockBuilder(block).cells([cell]).build()
    }

    private _renderTableEnd(block: Block): Block {
        const suffix = '-end'
        const uuid = block.uuid.slice(0, block.uuid.length - suffix.length)
        const node = this._map.get(uuid)
        if (!isTable(node))
            return block
        const cells: HsfCell[] = []
        const first = new CellBuilder().baseStyle(BaseStyle.TABLE_END).build()
        cells.push(first)
        node.getLeafCols().forEach((c: Readonly<Column>): void => {
            const tags = c.separator ? [StyleTag.CROSS_SEPARATOR] : []
            const cell = new CellBuilder()
                .baseStyle(BaseStyle.TABLE_END)
                .tags(tags)
                .build()
            cells.push(cell)
        })
        return new BlockBuilder(block).cells(cells).build()
    }

    private _renderHeaderInterval(block: Block): Block {
        const uuid = block.uuid.split('|')[0]
        const table = this._map.get(uuid)
        if (!isTable(table))
            return block
        const cols = table.getLeafCols()
        const cells: HsfCell[] = []
        const firstTags: StyleTag[] = []
        if (cols.length === 0)
            firstTags.push(StyleTag.LAST_COLUMN)
        const firstCell = new CellBuilder()
            .baseStyle(BaseStyle.EMPTY)
            .tags(firstTags)
            .build()
        cells.push(firstCell)
        cols.forEach((col: Readonly<Column>): void => {
            const position = this._status.getColumnType(col.uuid) ??
                ColumnPositionType.NONE
            const tags = []
            tags.push(...getColumnPosTag(position))
            const c = new CellBuilder()
                .baseStyle(BaseStyle.EMPTY)
                .tags(tags)
                .build()
            cells.push(c)
        })
        return new BlockBuilder(block).cells(cells).build()
    }

    /**
     * In this procedure, we do not set the value or formula of a cell. We set
     * the cell style into a map.
     */
    // tslint:disable-next-line: max-func-body-length
    private _renderRow(block: HsfRow): HsfRow {
        const row = this._map.get(block.uuid)
        if (!isRow(row))
            return block
        const table = row.getTable()
        if (!isTable(table))
            return block
        const cols = table.getLeafCols()
        const value = new CellValueBuilder().text(row.name).build()
        const styleTags: StyleTag[] = []
        if (block.separator)
            styleTags.push(StyleTag.ROW_SEPARATOR)
        const nameCell = new CellBuilder()
            .value(value)
            .baseStyle(BaseStyle.ROW)
            .tags(styleTags)
            .build()
        const hasExpr = hasExpression(row)
        const dataCells: DataCell[] = []
        const cellExprs = this._exprManager.cellStorage.getRowCellExpr(row)
        // tslint:disable-next-line: max-func-body-length
        cols.forEach((col: Readonly<Column>, idx: number): void => {
            // Set style.
            const tags = []
            const colType = this._status
                .getColumnType(col.uuid) ?? ColumnPositionType.NONE
            tags.push(...getColumnPosTag(colType))
            if (row.separator && col.separator)
                tags.push(StyleTag.CROSS_SEPARATOR)
            else if (row.separator)
                tags.push(StyleTag.ROW_SEPARATOR)
            else if (col.separator)
                tags.push(StyleTag.COL_SEPARATOR)
            if (block.isDefScalar &&
                !this._hasInputValue(row.uuid, cols[idx].uuid))
                tags.push(...this._setScalar(idx, hasExpr))
            const cellExpr = cellExprs[idx]
            const typeTag = getCellTypeTag(cellExpr)
            tags.push(typeTag)
            const lastDc = dataCells[dataCells.length - 1]
            if (lastDc !== undefined
                && typeTag === StyleTag.ASSUMPTION
                && lastDc.tags.includes(StyleTag.ASSUMPTION)) {
                tags.push(StyleTag.CLEAR_LEFT_BORDER)
                // tslint:disable-next-line: no-type-assertion
                const writableLastDc = lastDc as Writable<DataCell>
                writableLastDc.tags =
                    [...lastDc.tags, StyleTag.CLEAR_RIGHT_BORDER]
            }
            // Set formula
            const inNodes = cellExpr.inNodes.map((
                c: readonly [string, string],
            ): string => getCellId(c[0], c[1]))
            const formula = new FormulaInfoBuilder()
                .op(cellExpr.op)
                .priority(cellExpr.priority)
                .inNodes(inNodes)
                .build()
            const builder = new DataCellBuilder()
                .table(table.uuid)
                .baseStyle(
                    hasExpr ? BaseStyle.FORMULA_CELL : BaseStyle.VALUE_CELL,
                )
                .col(col.uuid)
                .row(row.uuid)
                .formula(formula)
                .tags(tags)
            // Set source value.
            const source = this._sourceManager.getSource(row.uuid, col.uuid)
            if (source !== undefined) {
                const sourceType = source.sourceType === SourceType.DATABASE
                    ? ValueSourceType.DATABASE
                    : ValueSourceType.MANUAL
                const v = source.value
                const valueBuilder = new CellValueBuilder()
                    .sourceType(sourceType)
                if (typeof v === 'string')
                    builder.value(valueBuilder.text(v).build())
                else
                    builder.value(valueBuilder.number(v).build())
            }

            const customFormula = this._formulaManager
                .getFormula(row.uuid, col.uuid)

            if (customFormula !== undefined)
                builder.customFormula(customFormula)

            const dc = builder.build()
            const cellId = getCellId(row.uuid, col.uuid)
            this._status.addDataCell(cellId, dc)
            dataCells.push(dc)
        })
        const hsfRow = new HsfRowBuilder(block)
            .nameCell(nameCell)
            .dataCells(dataCells)
            .build()
        this._lastRow = hsfRow
        return hsfRow
    }

    // tslint:disable-next-line: prefer-function-over-method
    private _setScalar(idx: number, hasExpr: boolean): readonly StyleTag[] {
        const tags: StyleTag[] = []
        if (idx > 0)
            tags.push(StyleTag.OTHER_SCALAR)
        else if (hasExpr)
            tags.push(StyleTag.SCALAR_EXPR)
        else
            tags.push(StyleTag.SCALAR_EMPTY)
        return tags
    }

    private _renderColumn(block: HsfColumn): HsfColumn {
        const node = this._map.get(block.uuid)
        if (node === undefined)
            return block
        const value = new CellValueBuilder().text(node.name).build()
        this._status.addColumnType(block.uuid, block.position)
        const styleTags: StyleTag[] = []
        if (block.separator)
            styleTags.push(StyleTag.COL_SEPARATOR)
        styleTags.push(...getColumnPosTag(block.position))
        const cell = new CellBuilder()
            .value(value)
            .baseStyle(BaseStyle.COLUMN)
            .tags(styleTags)
            .build()
        return new HsfColumnBuilder(block).cells([cell]).build()
    }

    private _renderColumnBlock(block: Block): Block {
        const node = this._map.get(block.uuid)
        if (node === undefined)
            return block
        const value = new CellValueBuilder().text(node.name).build()
        const cell = new CellBuilder()
            .value(value)
            .baseStyle(BaseStyle.COLUMN_BLOCK)
            .build()
        return new BlockBuilder(block).cells([cell]).build()
    }

    private _hasInputValue(rowId: string, columnId: string): boolean {
        const source = this._sourceManager.getSource(rowId, columnId)
        if (source === undefined)
            return false
        if (source.value === '')
            return false
        return true
    }
}

function hasExpression(row: Readonly<Row>): boolean {
    if (row.expression.trim().length > 0)
        return true
    for (const slice of row.sliceExprs)
        if (slice.expression.trim().length > 0)
            return true
    return false
}

function getCellTypeTag(cell: CellExpr): StyleTag {
    switch (cell.type) {
    case Type.ASSUMPTION:
        return StyleTag.ASSUMPTION
    case Type.FACT:
        return StyleTag.FACT
    case Type.CONSTRAINT:
        return StyleTag.CONSTRAINT
    case Type.FX:
    default:
        return StyleTag.FX
    }
}
// tslint:disable-next-line: max-file-line-count
