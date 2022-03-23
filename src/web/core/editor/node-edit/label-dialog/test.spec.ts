// tslint:disable: no-magic-numbers no-type-assertion
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {DebugElement} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {FormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {By} from '@angular/platform-browser'
import {
    Book,
    BookBuilder,
    ColumnBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    NodeFocusService,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {StudioApiService} from '@logi/src/web/global/api'

import {LabelDialogComponent} from './component'
import {LabelDialogService} from './service'

// tslint:disable: unknown-instead-of-any
// tslint:disable-next-line: max-func-body-length
describe('Label dialog component test: ', (): void => {
    let focusSvc: NodeFocusService
    let apiSvc: StudioApiService
    let histLabelSvc: LabelDialogService
    let fixture: ComponentFixture<LabelDialogComponent>
    let component: LabelDialogComponent
    let row1: Row
    let row2: Row
    let row3: Row
    let table1: Table
    // tslint:disable-next-line: max-func-body-length
    beforeEach(async(): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [LabelDialogComponent],
            imports: [
                FormsModule,
                MatDialogModule,
                MatIconModule,
                MatSnackBarModule,
                HttpClientTestingModule,
                MatRippleModule,
                EditorTestModule,
            ],
            providers: [
                StudioApiService,
                LabelDialogService,
                NodeFocusService,
                {
                    provide: MatDialogRef,
                    // tslint:disable-next-line: no-empty
                    useValue: {close: (): void => {}},
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: [false],
                },
            ],
        })
        apiSvc = TestBed.inject(StudioApiService)
        const book = mockBook()
        spyOn(apiSvc, 'currBook').and.returnValue(book)
        focusSvc = TestBed.inject(NodeFocusService)
        histLabelSvc = TestBed.inject(LabelDialogService)
        table1 = book.sheets[0].tree[0] as Table
        row1 = table1.rows[0] as Row
        row2 = table1.rows[1] as Row
        row3 = table1.rows[2] as Row
        const config = new SelConfigBuilder().multiSelect(true).build()
        const selectedNodes = [row1, row2, row3]
        const selectedNodeIds = selectedNodes.map(n => n.uuid)
        focusSvc.setSelNodes(selectedNodeIds, undefined, config)
        spyOn(focusSvc, 'getSelNodes').and.returnValue(selectedNodes)
        fixture = TestBed.createComponent(LabelDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should display curlabel histlabel and new label', (): void => {
        const histLabels = ['0', '1', '2', '3', '4']
        const curLabels = ['0', '1', '2']

        expect(component.curLabel).toEqual(['0', '1', '2'])
        expect(component.histLabel).toEqual(histLabels)

        const inputlabels = fixture.debugElement
            .queryAll(By.css('.input-label'))
        expect(inputlabels.length).toBe(3)
        inputlabels.forEach((sub: DebugElement, i: number): void => {
            expect(sub.nativeElement.textContent).toBe(curLabels[i])
        })

        const newLabels = fixture.debugElement.queryAll(By.css('input'))
        expect(newLabels.length).toBe(1)
        expect(newLabels[0].nativeElement.placeholder).toBe('输入文本，回车新建标签')

        const oldLabels = fixture.debugElement.queryAll(By.css('.label-text'))
        expect(oldLabels.length).toBe(histLabels.length)
        oldLabels.forEach((sub: DebugElement, i: number): void => {
            expect(sub.nativeElement.textContent).toBe(histLabels[i])
        })
    })

    it('current label modify', () => {
        spyOn(apiSvc, 'handleAction')
        spyOn<any>(component, '_addHistLabel')
        // @ts-ignore
        component._modifiedLabel('123', 0)
        expect(apiSvc.handleAction).toHaveBeenCalled()
        // @ts-ignore
        expect(component._addHistLabel).toHaveBeenCalledWith('123')
    })

    it('current label add', () => {
        spyOn(apiSvc, 'handleAction')
        spyOn<any>(component, '_addHistLabel')
        spyOn<any>(component, '_findNode').and.returnValue([row1, row2, row3])
        component.addLabel('123')
        // @ts-ignore
        expect(component._addHistLabel).toHaveBeenCalledWith('123')
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })

    it('current label delete', () => {
        spyOn(apiSvc, 'handleAction')
        spyOn<any>(component, '_findNode').and.returnValue([row1, row2, row3])
        component.removeCurLabel(0)
        expect(apiSvc.handleAction).toHaveBeenCalled()
    })

    it('hist label delete', () => {
        spyOn(histLabelSvc, 'removeUsedLabel')
        spyOn(histLabelSvc, 'getUsedLabel')
        component.removeHistLabel('1')
        expect(histLabelSvc.removeUsedLabel).toHaveBeenCalledWith('1')
        expect(histLabelSvc.getUsedLabel).toHaveBeenCalled()
    })
})

function mockBook(): Readonly<Book> {
    const table1 = new TableBuilder()
        .name('table1')
        .subnodes([
            new RowBuilder().name('row1').labels(['0']).build(),
            new RowBuilder().name('row2').labels(['1']).build(),
            new RowBuilder().name('row3').labels(['2']).build(),
        ])
        .build()
    const table2 = new TableBuilder()
        .name('table2')
        .subnodes([
            new ColumnBuilder().name('col1').labels(['3']).build(),
            new ColumnBuilder().name('col2').labels(['4']).build(),
            new RowBuilder().name('row4').build(),
        ])
        .build()
    const sheet = new SheetBuilder()
        .name('sheet')
        .tree([table1, table2])
        .build()
    return new BookBuilder().name('book').sheets([sheet]).build()
}
