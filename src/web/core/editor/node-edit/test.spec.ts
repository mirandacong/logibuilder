// tslint:disable: no-magic-numbers no-type-assertion
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {Component, NgModule} from '@angular/core'
import {TestBed} from '@angular/core/testing'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIcon, MatIconModule} from '@angular/material/icon'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {
    Book,
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    NodeType,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    TemplateBuilder,
    TemplateSet,
    TemplateSetBuilder,
} from '@logi/src/lib/template'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {StudioApiService} from '@logi/src/web/global/api'
import {IconComponent} from '@logi/src/web/testing'

import {NodeEditService} from './service'

@Component({
    selector: 'logi-test',
    template: `
    <div></div>
    `,
})
export class TestComponent {}

@NgModule({
    declarations: [
        TestComponent,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class ExcelModule {}

// tslint:disable-next-line: max-func-body-length
describe('service test: ', (): void => {
    let apiSvc: StudioApiService
    let nodeEditSvc: NodeEditService
    let focusSvc: NodeFocusService
    let table1: Table
    let table2: Table
    let table3: Table
    let table4: Table
    beforeEach((): void => {
        TestBed
            .configureTestingModule({
                declarations: [TestComponent],
                imports: [
                    HttpClientTestingModule,
                    MatDialogModule,
                    MatSnackBarModule,
                    NoopAnimationsModule,
                    EditorTestModule,
                ],
            })
            .overrideModule(MatIconModule, {
                add: {
                    declarations: [IconComponent],
                    exports: [IconComponent],
                },
                remove: {
                    declarations: [MatIcon],
                    exports: [MatIcon],
                },
            })
        apiSvc = TestBed.inject(StudioApiService)
        nodeEditSvc = TestBed.inject(NodeEditService)
        focusSvc = TestBed.inject(NodeFocusService)
        const data = mockData()
        spyOn(apiSvc, 'currBook').and.returnValue(data.book)
        const sheet = data.book.sheets[0]
        table1 = sheet.tree[0] as Table
        table2 = sheet.tree[1] as Table
        table3 = sheet.tree[2] as Table
        table4 = sheet.tree[3] as Table
    })
    it('same table copy', (): void => {
        const nodes = [table1.rows[1].uuid, table1.rows[0].uuid]
        focusSvc.setSelNodes(nodes)
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.copy()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('diff table copy', (): void => {
        const nodes = [
            table2.rows[0].uuid,
            table3.rows[0].uuid,
            table1.rows[1].uuid,
            table1.rows[0].uuid,
        ]
        spyOn(apiSvc, 'handleAction')
        focusSvc.setSelNodes(nodes)
        nodeEditSvc.copy()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('canUnlink test', (): void => {
        expect(nodeEditSvc.canUnlink(table3)).toBe(false)
        const header = new ColumnBlockBuilder().name('template cb').build()
        spyOn(apiSvc, 'getNode').and.returnValue(header)
        expect(nodeEditSvc.canUnlink(table4)).toBe(true)
    })
})

// tslint:disable-next-line: max-func-body-length
describe('row actions test: ', (): void => {
    let apiSvc: StudioApiService
    let nodeEditSvc: NodeEditService
    let nodeFocusSvc: NodeFocusService
    let table1: Table
    let row1: Row
    beforeEach((): void => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                MatSnackBarModule,
                NoopAnimationsModule,
                EditorTestModule,
            ],
        })
        apiSvc = TestBed.inject(StudioApiService)
        nodeEditSvc = TestBed.inject(NodeEditService)
        nodeFocusSvc = TestBed.inject(NodeFocusService)
        const data = mockData()
        spyOn(apiSvc, 'currBook').and.returnValue(data.book)
        const sheet = data.book.sheets[0]
        table1 = sheet.tree[0] as Table
        row1 = table1.rows[0] as Row
        nodeFocusSvc.setSelNodes([row1.uuid])
        spyOn(nodeFocusSvc, 'getSelNodes').and.returnValue([row1])
    })
    it('copy', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.copy()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('paste', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.copy()
        nodeEditSvc.paste()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('cut', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.cut()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('insert', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeFocusSvc.setSelNodes([table1.rows[0].uuid])
        nodeEditSvc.insert()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('up', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeFocusSvc.setSelNodes([table1.rows[1].uuid])
        nodeEditSvc.upOrDown(true)
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('down', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeFocusSvc.setSelNodes([table1.rows[0].uuid])
        nodeEditSvc.upOrDown(false)
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('add sibling row', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.addSiblingNode(NodeType.ROW)
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('add sibling row block', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.addSiblingNode(NodeType.ROW_BLOCK)
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
    it('remove row', (): void => {
        spyOn(apiSvc, 'handleAction')
        nodeEditSvc.remove()
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })
})

describe('not belong reference header nodes', (): void => {
    beforeEach((): void => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                MatSnackBarModule,
                NoopAnimationsModule,
                EditorTestModule,
            ],
        })
    })
})

function mockData(
): {readonly book: Readonly<Book>, readonly templateSet: TemplateSet} {
    const table1 = new TableBuilder()
        .name('table1')
        .subnodes([
            new RowBuilder().name('row1').build(),
            new ColumnBuilder().name('col1').build(),
            new RowBuilder().name('row2').build(),
            new ColumnBuilder().name('col2').build(),
        ])
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes([
            new RowBuilder().name('row3').build(),
        ])
        .build()
    const table3 = new TableBuilder()
        .name('table3')
        .subnodes([new RowBuilder().name('row4').build()])
        .build()
    const cb = new ColumnBlockBuilder().name('template cb').build()
    const t1 = new TemplateBuilder().node(cb).build()
    const table4 = new TableBuilder()
        .name('table4')
        .referenceHeader(cb.uuid)
        .build()
    const table5 = new TableBuilder()
        .name('table5')
        .referenceHeader('')
        .subnodes([
            new RowBuilder().name('t5row1').build(),
            new ColumnBuilder().name('t5col1').build(),
            new RowBlockBuilder().name('t5rb1').build(),
            new ColumnBlockBuilder().name('t5cb1').build(),
        ])
        .build()
    const title1 = new TitleBuilder().name('title').build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2, table3, table4, table5, title1])
        .build()
    const book = new BookBuilder().name('book').sheets([sheet]).build()
    const templateSet = new TemplateSetBuilder().templates([t1]).build()
    return {book, templateSet}
}
