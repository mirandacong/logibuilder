import {
    Column,
    ColumnBlock,
    isColumn,
    isRow,
    isTitle,
    Node,
    Row,
    RowBlock,
    Sheet,
    Table,
    Title,
} from '@logi/src/lib/hierarchy/core'
import {Model} from '@logi/src/lib/model'

import {
    AreaBuilder,
    Block,
    BlockBuilder,
    BlockType,
    Book as HsfBook,
    BookBuilder as HsfBookBuilder,
    ColumnBuilder as HsfColumnBuilder,
    ColumnPositionType,
    Row as HsfRow,
    RowBuilder as HsfRowBuilder,
    Sheet as HsfSheet,
    SheetBuilder as HsfSheetBuilder,
    Table as HsfTable,
    TableBuilder as HsfTableBuilder,
    TableDataBuilder as HsfTableDataBuilder,
    TitleBuilder as HsfTitleBuilder,
} from './defs'
import {ConvertInfo, ConvertInfoBuilder, getColHeight} from './lib'

/**
 * Convert hierarchy book to a hsf book. In this procedure, no style information
 * is involved.
 */
export function transpile(
    model: Readonly<Model>,
): readonly [Readonly<HsfBook>, Map<string, number>] {
    if (model.book.sheets.length === 0)
        return [new HsfBookBuilder()
            .uuid(model.book.uuid)
            .build(), new Map<string, number>()]
    const transpiler = new Transpiler()
    return transpiler.getHsfBook(model)
}

class Transpiler {
    // tslint:disable-next-line: comment-for-export-and-public
    public getHsfBook(
        model: Readonly<Model>,
    ): readonly [Readonly<HsfBook>, Map<string, number>] {
        this._model = model
        const hierarchy = model.book
        const sheets: HsfSheet[] = []
        hierarchy.sheets.forEach((sheet: Readonly<Sheet>): void => {
            if (!sheet.visible)
                return
            sheets.push(this._convertSheet(sheet))
        })
        return [
            new HsfBookBuilder().uuid(hierarchy.uuid).sheets(sheets).build(),
            this._headerDepth,
        ]
    }

    private _model!: Model

    /**
     * The key is uuid of column block.
     * The value is [
     *      the length of current children except empty column block,
     *      the length of leaf columns under this block.
     *  ]
     */
    private _cbInfo = new Map<string, readonly [number, number]>()
    /**
     * key: uuid of tables.
     */
    private _headerDepth = new Map<string, number>()

    private _convertSheet(sheet: Readonly<Sheet>): HsfSheet {
        const tables = this._getTables(sheet)
        // tslint:disable-next-line: no-magic-numbers
        const area = new AreaBuilder().col(2).row(1).build()
        const margin = new BlockBuilder()
            .uuid('top-margin')
            .type(BlockType.TOP_MARGIN)
            .area(area)
            .build()
        return new HsfSheetBuilder()
            .uuid(sheet.uuid)
            .name(sheet.name)
            .margin(margin)
            .data(tables)
            .build()
    }

    private _getTables(sheet: Readonly<Sheet>): readonly HsfTable[] {
        const result: HsfTable[] = []
        const subnodes = sheet.tree
        let titles: Readonly<Title>[] = []
        subnodes.forEach((child: Readonly<Table | Title>): void => {
            if (isTitle(child)) {
                titles.push(child)
                return
            }
            if (titles.length === 0) {
                result.push(this._convertTable(child, sheet.name)[0])
                return
            }
            result.push(this._convertTitles(child, titles, sheet.name))
            titles = []
        })
        return result
    }

    // tslint:disable-next-line: max-func-body-length
    private _convertTable(
        node: Readonly<Table>,
        sheetName: string,
    ): readonly [HsfTable, number] {
        const convertInfo = this._convertCols(node)
        const rows: Block[] = []
        const cols = convertInfo.blocks
        const colDepth = convertInfo.level === 0 ? 1 : convertInfo.level
        const colNum = convertInfo.cols
        node.rows.forEach((child: Readonly<Row | RowBlock>): void => {
            if (!isRow(child)) {
                const rbBlocks = this._convertRowBlock(child, colNum, 0)
                rows.push(...rbBlocks)
            } else
                rows.push(...this._convertRow(child, colNum, 0))
        })
        const lastRow = rows.pop()
        if (lastRow !== undefined) {
            const modifier =
                this._model.modifierManager.getModifier(lastRow.uuid)
                ?? this._model.modifierManager.buildModifier(node.uuid)
            const newRow = new HsfRowBuilder(lastRow)
                .modifier(modifier)
                .last(true)
                .build()
            rows.push(newRow)
        }
        const stubArea = new AreaBuilder().row(colDepth).col(1).build()
        const leafCols = node
            .getLeafCols()
            .map((n: Readonly<Node>): string => n.uuid)
        const leafRows = node
            .getLeafRows()
            .map((n: Readonly<Node>): string => n.uuid)
        const tableName = new BlockBuilder()
            .uuid(`${node.uuid}-name`)
            .type(BlockType.TABLE_NAME)
            .cells([])
            .merge(true)
            .area(new AreaBuilder().row(1).col(colNum + 1).build())
            .build()
        const data = new HsfTableDataBuilder()
            .leafCols(leafCols)
            .leafRows(leafRows)
            .sheetName(sheetName)
            .build()
        const stub = new BlockBuilder()
            .uuid(node.uuid)
            .area(stubArea)
            .cells([])
            .merge(true)
            .childrenCount(colNum)
            .type(BlockType.TABLE)
            .build()
        const tableEnd = new BlockBuilder()
            .type(BlockType.TABLE_END)
            .uuid(`${node.uuid}-end`)
            .merge(false)
            .cells([])
            .area(new AreaBuilder().col(colNum + 1).row(1).build())
            .build()
        this._headerDepth.set(node.uuid, stubArea.row)
        const table = new HsfTableBuilder()
            .data(data)
            .name(tableName)
            .stub(stub)
            .rows(rows)
            .cols(cols)
            .end(tableEnd)
            .build()
        return [table, colNum]
    }

    private _convertCols(t: Readonly<Table>): ConvertInfo {
        this._setColBlockInfo(t.cols)
        const leafCols = t.getLeafCols()
        const height = getColHeight(leafCols)
        const blocks = this._visitCols(t.cols, 1, height)
        return new ConvertInfoBuilder()
            .blocks(blocks)
            .cols(leafCols.length)
            .level(height)
            .build()
    }

    private _setColBlockInfo(
        cols: readonly Readonly<Column | ColumnBlock>[],
    ): void {
        cols.forEach((c: Readonly<Column | ColumnBlock>): void => {
            if (isColumn(c))
                return
            this._setColBlockInfo(c.tree)
            let directChildrenLen = 0
            let leafColsLen = 0
            c.tree.forEach((child: Readonly<Column | ColumnBlock>): void => {
                if (isColumn(child)) {
                    leafColsLen += 1
                    directChildrenLen += 1
                    return
                }
                const cbInfo = this._cbInfo.get(child.uuid)
                if (cbInfo === undefined)
                    return
                if (cbInfo[1] !== 0)
                    directChildrenLen += 1
                leafColsLen += cbInfo[1]
            })
            this._cbInfo.set(c.uuid, [directChildrenLen, leafColsLen])
        })
    }

    // tslint:disable-next-line: max-func-body-length
    private _visitCols(
        cols: readonly Readonly<Column | ColumnBlock>[],
        depth: number,
        totalHeight: number,
    ): readonly Block[] {
        const blocks: Block[] = []
        const validCols = cols.filter((
            c: Readonly<Column | ColumnBlock>,
        ): boolean => {
            if (isColumn(c))
                return true
            const info = this._cbInfo.get(c.uuid)
            return info !== undefined && info[1] > 0
        })
        validCols.forEach((
            c: Readonly<Column | ColumnBlock>,
            i: number,
        ): void => {
            if (!isColumn(c)) {
                const cbInfo = this._cbInfo.get(c.uuid)
                if (cbInfo === undefined)
                    return
                const currentChildrenLen = cbInfo[0]
                const leafColsLen = cbInfo[1]
                if (leafColsLen === 0)
                    return
                const cbArea = new AreaBuilder().row(1).col(leafColsLen).build()
                const cb = new BlockBuilder()
                    .uuid(c.uuid)
                    .area(cbArea)
                    .merge(true)
                    .type(BlockType.COLUMN_BLOCK)
                    .childrenCount(currentChildrenLen)
                    .cells([])
                    .build()
                blocks.push(cb)
                const subBlocks = this
                    ._visitCols(c.tree, depth + 1, totalHeight)
                blocks.push(...subBlocks)
                return
            }
            let pos: ColumnPositionType
            // tslint:disable-next-line: prefer-conditional-expression
            if (validCols.length === 1)
                pos = ColumnPositionType.ONLY
            else if (i === 0)
                pos = ColumnPositionType.FIRST
            else if (i === validCols.length - 1)
                pos = ColumnPositionType.LAST
            else
                pos = ColumnPositionType.MIDDLE
            const rowArea = totalHeight - depth + 1
            const area = new AreaBuilder().row(rowArea).col(1).build()
            const block = new HsfColumnBuilder()
                .uuid(c.uuid)
                .merge(rowArea > 1)
                .position(pos)
                .separator(c.separator)
                .area(area)
                .cells([])
                .type(BlockType.COLUMN)
                .build()
            blocks.push(block)
        })
        return blocks
    }

    private _convertRowBlock(
        node: Readonly<RowBlock>,
        cols: number,
        depth: number,
    ): readonly Block[] {
        const count = node.tree.length
        const area = new AreaBuilder().row(0).col(0).build()
        const rowBlock = new BlockBuilder()
            .uuid(node.uuid)
            .area(area)
            .cells([])
            .type(BlockType.ROW_BLOCK)
            .childrenCount(count)
            .merge(false)
            .build()
        const result: Block[] = [rowBlock]
        node.tree.forEach((child: Readonly<Row | RowBlock>): void => {
            if (!isRow(child)) {
                const blocks = this._convertRowBlock(child, cols, depth + 1)
                result.push(...blocks)
            } else
                result.push(...this._convertRow(child, cols, depth + 1))
        })
        return result
    }

    private _convertRow(
        node: Readonly<Row>,
        cols: number,
        depth: number,
    ): readonly HsfRow[] {
        const modifier = this._model.modifierManager.getModifier(node.uuid)
            ?? this._model.modifierManager.buildModifier(node.uuid)
        const area = new AreaBuilder().row(1).col(cols + 1).build()
        const row = new HsfRowBuilder()
            .uuid(node.uuid)
            .merge(false)
            .isDefScalar(node.isDefScalar)
            .area(area)
            .separator(node.separator)
            .modifier(modifier)
            .depth(depth)
            .cells([])
            .type(BlockType.ROW)
            .build()
        return [row]
    }

    private _convertTitles(
        table: Readonly<Table>,
        titles: readonly Readonly<Title>[],
        sheetName: string,
    ): HsfTable {
        const data = this._convertTable(table, sheetName)
        const result: Block[] = []
        const cols = data[1]
        titles.forEach((t: Readonly<Title>): void => {
            result.push(...this._getTitleBlocks(t, cols)[0])
        })
        return new HsfTableBuilder(data[0]).titles(result).build()
    }

    /**
     * Use post order walk. Given a title like this:
     * - Title1
     *    - SubTitle2
     *      - SubTitle3
     * The depth of the title1 is 3, and the depth of SubTitle is 2.
     */
    // tslint:disable-next-line: prefer-function-over-method
    private _getTitleBlocks(
        title: Readonly<Title>,
        cols: number,
        currDepth = 0,
    ): readonly [readonly Block[], number] {
        const blocks: Block[] = []
        let maxDepth = currDepth
        for (let i = title.tree.length - 1; i >= 0; i -= 1) {
            const t = title.tree[i]
            if (!isTitle(t))
                continue
            const data = this._getTitleBlocks(t, cols, currDepth)
            blocks.unshift(...data[0])
            if (data[1] > maxDepth)
                maxDepth = data[1]
        }
        const topTitle = new HsfTitleBuilder()
            .uuid(title.uuid)
            .type(BlockType.TITLE)
            .childrenCount(title.tree.length)
            .depth(maxDepth + 1)
            .cells([])
            .merge(true)
            .area(new AreaBuilder().col(cols + 1).row(1).build())
            .build()
        blocks.unshift(topTitle)
        // If it has subnodes, this title should not have an interval.
        // Because its last subnode will build interval.
        if (title.tree.length > 0)
            return [blocks, maxDepth + 1]
        blocks.push(new BlockBuilder()
            .type(BlockType.TITLE_INTERVAL)
            .area(new AreaBuilder().col(0).row(1).build())
            .merge(false)
            .uuid(`${title.uuid}|interval`)
            .cells([])
            .build(),
        )
        return [blocks, maxDepth + 1]
    }
}
// tslint:disable-next-line: max-file-line-count
