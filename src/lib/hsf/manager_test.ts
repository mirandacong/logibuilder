// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: ordered-imports
import {isException} from '@logi/base/ts/common/exception'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {
    ALL_TYPES,
    BookBuilder,
    ColumnBuilder,
    getNodesVisitor,
    Node,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {Model, ModelBuilder} from '@logi/src/lib/model'
import {
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'
import {CoverDataBuilder, getIdentifiedCell} from './convert/cover'

import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {convertToExcel, getDownloadExcel} from './convert/to_excel'
import {Book as HsfBook, DataCell} from './defs'
import {HsfManager} from './manager'

// tslint:disable-next-line: max-func-body-length
describe('hsf manager test', (): void => {
    let manager: HsfManager
    let exprManager: ExprManager
    let model: Model
    let hsf: HsfBook
    beforeAll((): void => {
        manager = new HsfManager()
        model = buildModel()
        exprManager = new ExprManager()
        exprManager.convert(model.book)
        const map = new Map<string, Readonly<Node>>()
        const nodes = preOrderWalk(model.book, getNodesVisitor, ALL_TYPES)
        nodes.forEach(n => map.set(n.uuid, n))
        hsf = manager.render(model, exprManager, map)
    })
    it('get cell address', (): void => {
        const addr = manager.getCellAddress('row1_uuid', 'col1_uuid')
        expect(isException(addr)).toBe(false)
        if (isException(addr))
            return
        // tslint:disable-next-line: no-magic-numbers
        expect(addr.row).toBe(4)
        // tslint:disable-next-line: no-magic-numbers
        expect(addr.col).toBe(1)
    })
    it('get node address', (): void => {
        const addr = manager.getNodeAddress('sheet1', 'table_uuid')
        expect(isException(addr)).toBe(false)
        if (isException(addr) || addr === undefined)
            return
        // tslint:disable-next-line: no-magic-numbers
        expect(addr.row).toBe(3)
        expect(addr.col).toBe(0)
    })
    it('get node', (): void => {
        const sheetName = 'sheet1'
        const cellRow = 4
        const cellCol = 0
        const nodeId = manager.getNode(sheetName, cellRow, cellCol)
        expect(nodeId).toBe('row1_uuid')
        const cellRow2 = 5
        const cellCol2 = 0
        const nodeId2 = manager.getNode(sheetName, cellRow2, cellCol2)
        expect(nodeId2).toBe('row2_uuid')
    })
    it('get cell', (): void => {
        const sheetName = 'sheet1'
        const cellRow = 4
        const cellCol = 1
        const cell = manager.getCell(sheetName, cellRow, cellCol)
        expect(cell).toEqual(['row1_uuid', 'col1_uuid'])
    })
    it('find data cell', (): void => {
        const sheetName = 'sheet1'
        const cellRow = 4
        const cellCol = 1
        const filter = (
            dc: DataCell,
        ): boolean => dc.row === 'row1_uuid' && dc.col === 'col1_uuid'
        const result = manager.findDataCells(sheetName, filter)
        expect(result.length).toBe(1)
        const dataCell = result[0]
        expect(dataCell[1].row).toBe(cellRow)
        expect(dataCell[1].col).toBe(cellCol)
    })
    it('get viz data should no exception', (): void => {
        const excel = convertToExcel(hsf)
        const vizData = manager.getVizData('row1_uuid', 'col1_uuid', excel)
        expect(isException(vizData)).toBe(false)
    })
    it('get download excel', (): void => {
        const coverData = new CoverDataBuilder()
            .projId('projId')
            .modelId('modelId')
            .corpName('Company Name')
            .stockCode('000000')
            .editor('editor')
            .lastModified('2020-07-22 23:34')
            .modelName('Model Name')
            .custom('Custom')
            .industry('Industry')
            .projName('Project Name')
            .build()
        const uuid = model.book.uuid
        const ori = convertToExcel(hsf)
        const excel = getDownloadExcel(ori, coverData, uuid)
        expect(excel).toBeDefined()
        if (excel === undefined)
            return
        expect(excel.sheets[0].name()).toBe('Cover')
        const idCell = getIdentifiedCell(excel.sheets[0])
        expect(idCell.value()).toBe(model.book.uuid)
    })
})

function buildModel(): Readonly<Model> {
    const book = new BookBuilder().name('book').build()
    const sheet = new SheetBuilder().name('sheet1').build()
    book.insertSubnode(sheet)
    const table = new TableBuilder().uuid('table_uuid').name('table').build()
    sheet.insertSubnode(table)
    const row1 = new RowBuilder().uuid('row1_uuid').name('row1').build()
    const col1 = new ColumnBuilder().uuid('col1_uuid').name('col1').build()
    table.insertSubnode(row1)
    table.insertSubnode(col1)
    const row2 = new RowBuilder().uuid('row2_uuid').name('row2').build()
    const rb = new RowBlockBuilder().name('rb').tree([row2]).build()
    table.insertSubnode(rb)
    const source = new ManualSourceBuilder().value(1).build()
    const item = new ItemBuilder()
        .row(row1.uuid)
        .col(col1.uuid)
        .source(source)
        .build()
    const sourceManager = new SourceManager([item])
    return new ModelBuilder().book(book).sourceManager(sourceManager).build()
}
