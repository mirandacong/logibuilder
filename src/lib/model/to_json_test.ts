// tslint:disable: no-magic-numbers
import {
    AnnotationKey,
    Book,
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    NodeType,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    TableBuilder,
    TitleBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'

import {ModelBuilder} from './base'
import {toJson} from './to_json'

// tslint:disable-next-line: unknown-instead-of-any
type JsonObj = any

// tslint:disable-next-line: max-func-body-length
describe('tojson test', (): void => {
    let book: Readonly<Book>
    let json: JsonObj
    // tslint:disable-next-line: max-func-body-length
    beforeEach((): void => {
        book = new BookBuilder()
            .name('book')
            .labels(['blabel', 'blabel2'])
            .build()
        const sheet = new SheetBuilder()
            .name('sheet')
            .labels(['slabel', 'slabel'])
            .build()
        book.insertSubnode(sheet)
        const table1 = new TableBuilder()
            .name('table1')
            .labels(['table', 'table'])
            .build()
        const table2 = new TableBuilder()
            .name('table2')
            .labels(['table', 'table'])
            .build()
        const title = new TitleBuilder()
            .name('title')
            .labels(['tlabel', 'tlabel'])
            .build()
        title.insertSubnode(table1)
        sheet.insertSubnode(title)
        sheet.insertSubnode(table2)
        const rs1 = new SliceExprBuilder()
            .name('hist')
            .expression('')
            .annotations(new Map<AnnotationKey, string>([
                [AnnotationKey.LINK_NAME, 'slice1'],
                [AnnotationKey.LINK_CODE, 'slice2'],
            ]))
            .build()
        const rowblock1 = new RowBlockBuilder().name('rowblock').build()
        const row = new RowBuilder()
            .uuid('row')
            .name('row')
            .isDefScalar(false)
            .expression('hist')
            .sliceExprs([rs1])
            .type(Type.FACT)
            .annotations(new Map<AnnotationKey, string>([
                [AnnotationKey.LINK_NAME, 'value1'],
                [AnnotationKey.LINK_CODE, 'value2'],
            ]))
            .build()
        const rowblock2 = new RowBlockBuilder().name('rowblock').build()
        rowblock1.insertSubnode(rowblock2)
        table2.insertSubnode(rowblock1)
        table2.insertSubnode(row)

        const cb1 = new ColumnBlockBuilder()
            .name('cb1')
            .labels(['sumption'])
            .build()
        const cb2 = new ColumnBlockBuilder()
            .name('cb2')
            .labels(['sumption'])
            .build()
        const cs1 = new SliceExprBuilder()
            .name('cs1')
            .expression('proj')
            .build()
        const col = new ColumnBuilder()
            .uuid('col')
            .name('col')
            .expression('proj')
            .sliceExprs([cs1])
            .build()
        cb2.insertSubnode(col)
        cb1.insertSubnode(cb2)
        table2.insertSubnode(cb1)
        const source = new ManualSourceBuilder().value(1).build()
        const item = new ItemBuilder()
            .source(source)
            .row('row')
            .col('col')
            .build()
        const sourceManager = new SourceManager([item])
        const model = new ModelBuilder()
            .book(book)
            .sourceManager(sourceManager)
            .build()
        json = toJson(model)
    })
    // tslint:disable-next-line: max-func-body-length
    it('book title table test', (): void => {
        const jsonBook = json.book
        expect(jsonBook.name).toBe('book')
        expect(jsonBook.nodetype).toBe(NodeType.BOOK)
        expect(jsonBook.labels).toEqual(['blabel', 'blabel2'])

        expect(jsonBook.subnodes.length).toBe(1)
        const sheet = jsonBook.subnodes[0]
        expect(sheet.name).toBe('sheet')
        expect(sheet.nodetype).toBe(NodeType.SHEET)
        expect(sheet.labels).toEqual(['slabel', 'slabel'])
        expect(sheet.subnodes.length).toBe(2)

        const title = sheet.subnodes[0]
        expect(title.name).toBe('title')
        expect(title.nodetype).toBe(NodeType.TITLE)
        expect(title.labels).toEqual(['tlabel', 'tlabel'])
        expect(title.subnodes.length).toBe(1)

        const table1 = title.subnodes[0]
        expect(table1.name).toBe('table1')
        expect(table1.nodetype).toBe(NodeType.TABLE)
        expect(table1.labels).toEqual(['table', 'table'])
        expect(table1.subnodes.length).toBe(0)

        const table2 = sheet.subnodes[1]
        expect(table2.subnodes.length).toBe(3)

        const rowblock1 = table2.subnodes[0]
        expect(rowblock1.name).toBe('rowblock')
        expect(rowblock1.nodetype).toBe(NodeType.ROW_BLOCK)
        expect(rowblock1.subnodes.length).toBe(1)

        const row = table2.subnodes[1]
        expect(row.name).toBe('row')
        expect(row.nodetype).toBe(NodeType.ROW)
        expect(row.expression).toBe('hist')
        expect(row.isDefScalar).toBe(false)
        expect(row.type).toBe(Type.FACT)
        expect(row.annotations.link_name).toBe('value1')
        expect(row.annotations.link_code).toBe('value2')
        expect(row.sliceExprs[0].annotations.link_name).toBe('slice1')
        expect(row.sliceExprs[0].annotations.link_code).toBe('slice2')

        const rowblock2 = rowblock1.subnodes[0]
        expect(rowblock2.name).toBe('rowblock')
        expect(rowblock2.nodetype).toBe(NodeType.ROW_BLOCK)

        const cb1 = table2.subnodes[2]
        expect(cb1.name).toBe('cb1')
        expect(cb1.nodetype).toBe(NodeType.COLUMN_BLOCK)
        expect(cb1.labels).toEqual(['sumption'])
        expect(cb1.subnodes.length).toBe(1)
        const cb2 = cb1.subnodes[0]
        expect(cb2.name).toBe('cb2')
        expect(cb2.nodetype).toBe(NodeType.COLUMN_BLOCK)
        expect(cb2.labels).toEqual(['sumption'])
        expect(cb2.subnodes.length).toBe(1)
        const col = cb2.subnodes[0]
        expect(col.expression).toBe('proj')
        expect(col.nodetype).toBe(NodeType.COLUMN)
        expect(col.type).toBe(Type.FX)
    })
})
