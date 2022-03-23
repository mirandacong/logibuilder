import {
    Clipboard,
    EditorService,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    BookBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    SliceExpr,
    SliceExprBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder} from './clipboard'

// tslint:disable-next-line: max-func-body-length
describe('set clipboard', (): void => {
    let service: EditorService
    let row: Readonly<Row>
    let slice: SliceExpr
    let clipboard: Clipboard
    beforeEach((): void => {
        slice = new SliceExprBuilder().name('slice').build()
        row = new RowBuilder().name('row').sliceExprs([slice]).build()
        const table = new TableBuilder().name('').subnodes([row]).build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        service = new EditorServiceBuilder().book(book).build()
        clipboard = service.clipboard
    })
    it('test copy nodes', (): void => {
        const action = new ActionBuilder()
            .content([row.uuid])
            .isCut(false)
            .build()
        handleAction(action, service)
        expect(clipboard.nodes[0]).toBe(row.uuid)
    })
    it('test cut nodes', (): void => {
        const action = new ActionBuilder()
            .content([row.uuid])
            .isCut(true)
            .build()
        handleAction(action, service)
        expect(clipboard.nodes[0]).toBe(row.uuid)
        expect(clipboard.isCut).toBe(true)
        clipboard.getNodes()
        expect(clipboard.nodes.length).toBe(0)
    })
    it('test copy slices', (): void => {
        const action = new ActionBuilder().content([slice]).isCut(false).build()
        handleAction(action, service)
        expect(clipboard.slices.length).toBe(1)
        expect(clipboard.slices[0]).toBe(slice.uuid)
    })
    it('test cut slice', (): void => {
        const action = new ActionBuilder().content([slice]).isCut(true).build()
        handleAction(action, service)
        expect(clipboard.slices[0]).toBe(slice.uuid)
        clipboard.getSlices()
        expect(clipboard.slices.length).toBe(0)
    })
    it('test mutual exclusion', (): void => {
        const action = new ActionBuilder()
            .content([row.uuid])
            .isCut(true)
            .build()
        handleAction(action, service)
        expect(clipboard.nodes.length).not.toBe(0)
        const action2 = new ActionBuilder()
            .content([slice])
            .isCut(false)
            .build()
        handleAction(action2, service)
        expect(clipboard.nodes.length).toBe(0)
        expect(clipboard.slices.length).not.toBe(0)
        const action3 = new ActionBuilder()
            .content([row.uuid])
            .isCut(true)
            .build()
        handleAction(action3, service)
        expect(clipboard.nodes.length).not.toBe(0)
        expect(clipboard.slices.length).toBe(0)
    })
})
