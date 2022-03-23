import {isException} from '@logi/base/ts/common/exception'
import {EditorService, EditorServiceBuilder} from '@logi/src/lib/api'
import {handleAction} from '@logi/src/lib/api/actions'
import {
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    SliceExprBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './rename_label'

describe('test rename label action', (): void => {
    let service: Readonly<EditorService>
    let fbs: string[]
    beforeEach((): void => {
        const col1 = new ColumnBuilder().name('col1').labels(['old']).build()
        const col2 = new ColumnBuilder()
            .name('col2')
            .labels(['old', 'dummy'])
            .build()
        const row1 = new RowBuilder()
            .name('row1')
            .sliceExprs([
                new SliceExprBuilder().name('old').build(),
                new SliceExprBuilder().name('old OR nice').build(),
            ])
            .build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([col1, col2, row1])
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
        fbs = [col1.uuid, col2.uuid]
    })
    it('rename label and slices should be renamed', (): void => {
        const action = new ActionBuilder()
            .formulabearers(fbs)
            .oldLabel('old')
            .newLabel('new')
            .build()
        const result = handleAction(action, service)
        expect(isException(result)).toBe(false)
        if (isException(result))
            return
        // tslint:disable-next-line: no-type-assertion
        const newTable = service.book.sheets[0].tree[0] as Readonly<Table>
        const cols = newTable.getLeafCols()
        expect(cols[0].name).toBe('col1')
        expect(cols[0].labels).toEqual(['new'])
        expect(cols[1].name).toBe('col2')
        expect(cols[1].labels).toEqual(['new', 'dummy'])
        const row = newTable.getLeafRows()[0]
        expect(row.sliceExprs[0].name).toBe('new')
        expect(row.sliceExprs[1].name).toBe('new OR nice')
    })
})
