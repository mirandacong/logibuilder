// tslint:disable: no-magic-numbers
import {FormulaItemBuilder, FormulaManager} from '@logi/src/lib/formula'
import {
    AnnotationKey,
    assertIsTable,
    Book,
    BookBuilder,
    ColumnBuilder,
    isRow,
    isTable,
    Row,
    RowBlockBuilder,
    RowBuilder,
    Sheet,
    SheetBuilder,
    SliceExprBuilder,
    Table,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {
    FontBuilder,
    FormatBuilder,
    ModifierBuilder,
    ModifierManager,
} from '@logi/src/lib/modifier'
import {
    DatabaseSourceBuilder,
    ItemBuilder,
    ManualSourceBuilder,
    SourceManager,
    SourceType,
} from '@logi/src/lib/source'

import {cloneHierarchy, ConfigBuilder, getCloneResult} from './clone'

describe('clone model', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('clone model', (): void => {
        const r = new RowBuilder().name('r').build()
        const c = new ColumnBuilder().name('c').build()
        const c2 = new ColumnBuilder().name('c2').build()
        const table = new TableBuilder().name('t').subnodes([r, c, c2]).build()
        const sheet = new SheetBuilder().name('s').tree([table]).build()
        const book = new BookBuilder().name('book').sheets([sheet]).build()

        const si1 = new ItemBuilder()
            .row(r.uuid)
            .col(c.uuid)
            .source(new DatabaseSourceBuilder().value(1).build())
            .build()
        const si2 = new ItemBuilder()
            .row(r.uuid)
            .col(c2.uuid)
            .source(new ManualSourceBuilder().value('a').build())
            .build()
        const sourceManager = new SourceManager([si1, si2])

        const formulaManager = new FormulaManager([
            new FormulaItemBuilder()
                .row(r.uuid)
                .col(c.uuid)
                .formula('1')
                .build(),
        ])

        const modifierManager = new ModifierManager([
            new ModifierBuilder()
                .uuid(r.uuid)
                .font(new FontBuilder().bold(true).build())
                .format(new FormatBuilder().percent(true).build())
                .build(),
        ])

        const res = getCloneResult(
            book,
            modifierManager,
            sourceManager,
            formulaManager,
        )

        const newTable = res.clonedNode.sheets[0].tree[0]
        assertIsTable(newTable)
        const newR = newTable.getLeafRows()[0]
        const newC = newTable.getLeafCols()[0]
        const newC2 = newTable.getLeafCols()[1]

        const fis = res.formulaItems
        expect(fis.length).toBe(1)
        expect(fis[0].row).toBe(newR.uuid)
        expect(fis[0].col).toBe(newC.uuid)
        expect(fis[0].formula).toBe('1')

        const ms = res.modifiers
        expect(ms.length).toBe(1)
        expect(ms[0].uuid).toBe(newR.uuid)
        expect(ms[0].font.bold).toBe(true)
        expect(ms[0].format.percent).toBe(true)

        const sis = res.sourceItems
        expect(sis.length).toBe(2)
        expect(sis[0].row).toBe(newR.uuid)
        expect(sis[0].col).toBe(newC.uuid)
        expect(sis[0].source.value).toBe(1)
        expect(sis[0].source.sourceType).toBe(SourceType.DATABASE)

        expect(sis[1].row).toBe(newR.uuid)
        expect(sis[1].col).toBe(newC2.uuid)
        expect(sis[1].source.value).toBe('a')
        expect(sis[1].source.sourceType).toBe(SourceType.MANUAL)
    })
})

// tslint:disable-next-line: max-func-body-length
describe('clone test', (): void => {
    let book: Readonly<Book>
    let sheet1: Readonly<Sheet>
    let table1: Readonly<Table>
    let row11: Readonly<Row>
    beforeEach((): void => {
        book = mockBook()
        sheet1 = book.sheets[0]
        const table = sheet1.tree[0]
        if (!isTable(table))
            return
        table1 = table
        const row = table1.rows[0]
        if (!isRow(row))
            return
        row11 = row
    })
    it('saveTableTemplate test', (): void => {
        const config = new ConfigBuilder().cloneReferenceHeader(true).build()
        const newTable = cloneHierarchy(table1, config)
        expect(newTable).not.toBe(table1)
        if (!isTable(newTable))
            return
        expect(newTable.headerStub).toBe(table1.headerStub)
        const newRow11 = newTable.rows[0]
        expect(newRow11).not.toBe(row11)
        if (!isRow(newRow11))
            return
        expect(newRow11.uuid).not.toBe(row11.uuid)
        expect(newRow11.separator).toBe(true)
        expect(newRow11.type).toBe(Type.ASSUMPTION)
        expect(newRow11.annotations.size).toBe(1)
        expect(newRow11.annotations.get(AnnotationKey.LINK_CODE)).toBe('code')
        expect(newRow11.sliceExprs.length).toBe(1)
        expect(newRow11.sliceExprs[0].name).toBe('row11Slice1')
        expect(newRow11.sliceExprs[0].expression).toBe('row11Slice1')
        expect(newRow11.sliceExprs[0].type).toBe(Type.ASSUMPTION)
        expect(newRow11.sliceExprs[0].annotations.size).toBe(1)
        expect(newRow11.sliceExprs[0].annotations.get(AnnotationKey.LINK_CODE))
            .toBe('slice')
    })
})

// tslint:disable-next-line: max-func-body-length
function mockBook(): Readonly<Book> {
    /**
     * Relative path refer to the row of difference table.
     */
    const row11Slice1 = new SliceExprBuilder()
        .name('row11Slice1')
        .expression('row11Slice1')
        .annotations(new Map([[AnnotationKey.LINK_CODE, 'slice']]))
        .type(Type.ASSUMPTION)
        .build()
    const row11 = new RowBuilder()
        .name('row11')
        .annotations(new Map([[AnnotationKey.LINK_CODE, 'code']]))
        .sliceExprs([row11Slice1])
        .expression('{table2!row21}')
        .separator(true)
        .type(Type.ASSUMPTION)
        .build()
    /**
     * Relative path refer to the row of the same table.
     */
    const row12 = new RowBuilder().name('row12').expression('{row11}').build()
    /**
     * Absolute path refer to the row of the difference table.
     */
    const row13 = new RowBuilder()
        .name('row13')
        .expression('{sheet1!table2!row21}')
        .build()
    /**
     * Absolute path refer to the row of the same table.
     */
    const row14 = new RowBuilder()
        .name('row14')
        .expression('{sheet1!table1!row11}')
        .build()
    const row15 = new RowBuilder().name('row15').build()
    const rb11 = new RowBlockBuilder().name('rb11').tree([row15]).build()
    const row16 = new RowBuilder()
        .name('row16')
        .expression('{sheet1!table1!rb11!row15}')
        .build()
    const table1 = new TableBuilder()
        .name('table1')
        .headerStub('stub')
        .subnodes([row11, row12, row13, row14, rb11, row16])
        .build()
    const row21 = new RowBuilder().name('row21').build()
    const row22 = new RowBuilder().name('row22').build()
    const row23 = new RowBuilder().name('row23').build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes([row21, row22, row23])
        .build()
    const sheet1 = new SheetBuilder()
        .name('sheet1')
        .tree([table1, table2])
        .build()
    return new BookBuilder().name('book').sheets([sheet1]).build()
}
