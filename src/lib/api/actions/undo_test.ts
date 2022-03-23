import {EditorService, EditorServiceBuilder} from '@logi/src/lib/api'
import {
    Book,
    BookBuilder,
    Column,
    ColumnBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {TemplateBuilder, TemplateSetBuilder} from '@logi/src/lib/template'

import {handle} from './handle'
import {SetNameActionBuilder} from './hierarchy'
import {SetSourceActionBuilder, SetSourceArgumentBuilder} from './source'
import {ActionBuilder} from './undo'

// tslint:disable-next-line: max-func-body-length
describe('undo', (): void => {
    let service: EditorService
    let book: Readonly<Book>
    let t: Readonly<Table>
    let row: Readonly<Row>
    let col: Readonly<Column>
    beforeEach((): void => {
        row = new RowBuilder().name('').build()
        col = new ColumnBuilder().name('').build()
        const table = new TableBuilder().name('').subnodes([row, col]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        book = new BookBuilder().name('0').sheets([sheet]).build()
        t = new TableBuilder().name('0').build()
        const template = new TemplateBuilder().node(t).build()
        const set = new TemplateSetBuilder().templates([template]).build()
        service = new EditorServiceBuilder().book(book).templateSet(set).build()
    })
    it('book change', (): void => {
        const action = new SetNameActionBuilder()
            .target(book.sheets[0].uuid)
            .name('1')
            .build()
        handle(action, service)
        const action2 = new SetNameActionBuilder()
            .target(book.sheets[0].uuid)
            .name('2')
            .build()
        handle(action2, service)
        const action3 = new SetNameActionBuilder()
            .target(book.sheets[0].uuid)
            .name('3')
            .build()
        handle(action3, service)
        expect(service.book.sheets[0].name).toBe('3')
        const undo = new ActionBuilder().build()
        handle(undo, service)
        expect(service.book.sheets[0].name).toBe('2')
        const undo2 = new ActionBuilder().build()
        handle(undo2, service)
        expect(service.book.sheets[0].name).toBe('1')
    })
    it('source change', (): void => {
        const args = [new SetSourceArgumentBuilder()
            .row(row.uuid)
            .col(col.uuid)
            .value(1)
            .build()]
        const action = new SetSourceActionBuilder().args(args).build()
        handle(action, service)
        expect(service.sourceManager.getSource(row.uuid, col.uuid)?.value)
            .toEqual(1)
        const undo = new ActionBuilder().build()
        handle(undo, service)
        expect(service.sourceManager.getSource(row.uuid, col.uuid))
            .toBeUndefined()
    })
    it('clear clipboard if undo cut', (): void => {
        const action = new SetNameActionBuilder()
            .target(book.sheets[0].uuid)
            .name('1')
            .build()
        handle(action, service)
        const clipboard = service.clipboard
        const node = new TableBuilder().name('').build()
        clipboard.setNodes([node.uuid], true)
        const undo = new ActionBuilder().build()
        handle(undo, service)
        expect(clipboard.nodes.length).toBe(0)
    })
})
