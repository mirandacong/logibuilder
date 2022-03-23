import {EditorService, EditorServiceBuilder} from '@logi/src/lib/api'
import {
    BookBuilder,
    Column,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    Table,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {Model, ModelBuilder} from '@logi/src/lib/model'
import {
    DatabaseSourceBuilder,
    ItemBuilder,
    ManualSource,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'

import {handle} from '../handle'

import {ActionBuilder} from './clear_data'

describe('clear data test', (): void => {
    let service: EditorService
    beforeEach((): void => {
        const model = buildModel()
        service = new EditorServiceBuilder()
            .book(model.book)
            .sourceManager(model.sourceManager)
            .build()
    })
    it('table', (): void => {
        // tslint:disable-next-line: no-type-assertion
        const table = service.book.sheets[0].tree[0] as Readonly<Table>
        const action = new ActionBuilder()
            .types([Type.FACT])
            .root(table.uuid)
            .build()
        handle(action, service)
        const row1 = table.rows[0]
        expect(row1.name).toBe('row1')
        const row2 = table.rows[1]
        expect(row2.name).toBe('row2')
        const cols = table.getLeafCols()
        cols.forEach((col: Readonly<Column>): void => {
            const source1 = service.sourceManager.getSource(row1.uuid, col.uuid)
            expect(source1?.value).toBeUndefined()
            const source2 = service.sourceManager.getSource(row2.uuid, col.uuid)
            expect(source2?.value).toEqual(1)
        })
        // tslint:disable-next-line: no-magic-numbers
        const row3 = table.rows[2]
        expect(cols[0].name).toBe('2017')
        expect(cols[1].name).toBe('2018')
        const s1 = service.sourceManager.getSource(row3.uuid, cols[0].uuid)
        expect(s1?.value).toBeUndefined()
        const s2 = service.sourceManager.getSource(row3.uuid, cols[1].uuid)
        expect(s2?.value).toEqual(1)
        // tslint:disable-next-line: no-magic-numbers
        const row4 = table.rows[3]
        const s3 = service.sourceManager.getSource(row4.uuid, cols[0].uuid)
        expect(s3?.value).toEqual(1)
    })
})

// tslint:disable-next-line: max-func-body-length
function buildModel(): Model {
    const row1 = new RowBuilder().name('row1').type(Type.FACT).build()
    const row2 = new RowBuilder().name('row2').type(Type.ASSUMPTION).build()
    const sliceExpr1 = new SliceExprBuilder()
        .name('HIST')
        .type(Type.FACT)
        .build()
    const sliceExpr2 = new SliceExprBuilder()
        .name('PROJ')
        .type(Type.ASSUMPTION)
        .build()
    const row3 = new RowBuilder()
        .name('row3')
        .type(Type.FX)
        .sliceExprs([sliceExpr1, sliceExpr2])
        .build()
    const row4 = new RowBuilder().name('row4').type(Type.FACT).build()
    const col1 = new ColumnBuilder().name('2017').labels(['HIST']).build()
    const col2 = new ColumnBuilder().name('2018').labels(['PROJ']).build()
    const table = new TableBuilder()
        .name('table')
        .subnodes([row1, row2, row3, row4, col1, col2])
        .build()
    const sheet = new SheetBuilder().tree([table]).name('sheet').build()
    const book = new BookBuilder().name('').sheets([sheet]).build()
    const item1 = new ItemBuilder()
        .row(row1.uuid)
        .col(col1.uuid)
        .source(buildSource(1))
        .build()
    const item2 = new ItemBuilder()
        .row(row1.uuid)
        .col(col2.uuid)
        .source(buildSource(1))
        .build()
    const item3 = new ItemBuilder()
        .row(row2.uuid)
        .col(col1.uuid)
        .source(buildSource(1))
        .build()
    const item4 = new ItemBuilder()
        .row(row2.uuid)
        .col(col2.uuid)
        .source(buildSource(1))
        .build()
    const item5 = new ItemBuilder()
        .row(row3.uuid)
        .col(col1.uuid)
        .source(buildSource(1))
        .build()
    const item6 = new ItemBuilder()
        .row(row3.uuid)
        .col(col2.uuid)
        .source(buildSource(1))
        .build()
    const item7 = new ItemBuilder()
        .row(row4.uuid)
        .col(col1.uuid)
        .source(new DatabaseSourceBuilder().value(1).build())
        .build()
    const sm = new SourceManager([
        item1,
        item2,
        item3,
        item4,
        item5,
        item6,
        item7,
    ])
    return new ModelBuilder().book(book).sourceManager(sm).build()
}

function buildSource(value: number | string): ManualSource {
    return new ManualSourceBuilder().value(value).build()
}
