// tslint:disable: unknown-instead-of-any no-magic-numbers
import {HttpClientTestingModule} from '@angular/common/http/testing'
import {TestBed} from '@angular/core/testing'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {
    Column,
    ColumnBlock,
    Node,
    Row,
    RowBlock,
    Sheet,
    SliceExpr,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {
    TableTabStatusService,
    TableTabView,
} from '@logi/src/web/core/editor/table-tab-status'
import {EditorTestModule} from '@logi/src/web/core/editor/test'
import {StudioApiService} from '@logi/src/web/global/api'

import {mockModel1} from './mock_model'
import {NodeFocusInfo, NodeFocusInfoBuilder} from './define'
import {NodeFocusService} from './service'

// tslint:disable-next-line: max-func-body-length
describe('Test service', (): void => {
    let service: NodeFocusService
    let activeSheet: Readonly<Sheet>
    let table1: Readonly<Table>
    let table2: Readonly<Table>
    let rowBlock1: Readonly<RowBlock>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let row3: Readonly<Row>
    let row4: Readonly<Row>
    let row5: Readonly<Row>
    let row6: Readonly<Row>
    let colBlock1: Readonly<ColumnBlock>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let col4: Readonly<Column>
    let col5: Readonly<Column>
    let col6: Readonly<Column>
    beforeEach((): void => {
        const modelData = mockModel1()
        activeSheet = modelData.sheet1
        table1 = modelData.table1
        table2 = modelData.table2
        rowBlock1 = modelData.rowBlock1
        row1 = modelData.row1
        row2 = modelData.row2
        row3 = modelData.row3
        row4 = modelData.row4
        row5 = modelData.row5
        row6 = modelData.row6
        colBlock1 = modelData.colBlock1
        col1 = modelData.col1
        col2 = modelData.col2
        col3 = modelData.col3
        col4 = modelData.col4
        col5 = modelData.col5
        col6 = modelData.col6
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                EditorTestModule,
            ],
        })
        service = TestBed.inject(NodeFocusService)
        const tableTabSvc = TestBed.inject(TableTabStatusService)
        tableTabSvc.setTabStatus(table1, TableTabView.COLUMN)
        const apiSvc = TestBed.inject(StudioApiService)
        spyOn(apiSvc, 'getActiveSheet').and.returnValue(activeSheet.name)
        spyOn(apiSvc, 'currBook').and.returnValue(modelData.book)
        // @ts-ignore
        spyOnProperty(apiSvc.api, 'bookMap').and.returnValue(modelData.nodeMap)
    })

    it('select all with no node selected', (): void => {
        service.sels.set(activeSheet.name, [])
        service.selectAll()
        const infos = service.sels.get(activeSheet.name) ?? []
        expect(infos.length).toBe(2)
        expect(getNodeIds(infos)).toEqual([table1.uuid, table2.uuid])
    })

    it('select all with table node selected and column view', (): void => {
        setSelNode(table1)
        service.selectAll()
        const infos = service.sels.get(activeSheet.name) ?? []
        expect(infos.length).toBe(table1.cols.length)
        const expectedIds = table1.cols.map(col => col.uuid)
        expect(getNodeIds(infos)).toEqual(expectedIds)
    })

    describe('row node test', (): void => {
        it('select all with row(under table) selected', (): void => {
            setSelNode(row1)
            service.selectAll()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(infos.length).toBe(table1.rows.length)
            const expectedIds = table1.rows.map(row => row.uuid)
            expect(getNodeIds(infos)).toEqual(expectedIds)
        })

        it('select all with row(under row block) selected', (): void => {
            setSelNode(row2)
            service.selectAll()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(infos.length).toBe(2)
            expect(getNodeIds(infos)).toEqual([row2.uuid, row3.uuid])
        })

        // tslint:disable-next-line: max-func-body-length
        it('continuous select by shift click', (): void => {
            /**
             * current and target are from different table.
             */
            setSelNode(row4)
            service.continuousSelect(row6)
            const infos1 = service.sels.get(activeSheet.name) ?? []
            expect(infos1).toEqual([])
            setSelNode(row4)
            service.continuousSelect(row2)
            /**
             * shift + click
             * select before origin node
             */
            let infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([rowBlock1.uuid, row4.uuid])
            /**
             * shift + click
             * select after origin node
             */
            service.continuousSelect(row5)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row4.uuid, row5.uuid])
            /**
             * shift + click
             * select before origin node
             */
            service.continuousSelect(row1)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([
                row1.uuid,
                rowBlock1.uuid,
                row4.uuid,
            ])
            setSelNode(row3)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row3.uuid])
            /**
             * down + shift + click
             */
            service.selectNext()
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row4.uuid])
            service.continuousSelect(row5)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row4.uuid, row5.uuid])
            /**
             * up + shift + click
             */
            service.selectPrevious()
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row3.uuid])
            /**
             * ctrl + click + shift + click
             */
            setSelNode(row2)
            setSelNode(row4, undefined, true)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row2.uuid, row4.uuid])
            service.continuousSelect(row5)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row4.uuid, row5.uuid])
        })

        it('shift click and select all', (): void => {
            setSelNode(row5)
            service.continuousSelect(row4)
            service.selectAll()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([
                row1.uuid,
                rowBlock1.uuid,
                row4.uuid,
                row5.uuid,
            ])
        })

        it('shift up and select all', (): void => {
            setSelNode(row5)
            service.continuousSelectWithKeyboard(true)
            service.selectAll()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([
                row1.uuid,
                rowBlock1.uuid,
                row4.uuid,
                row5.uuid,
            ])
        })

        it('shift click and select previous', (): void => {
            setSelNode(row4)
            service.continuousSelect(row3)
            service.selectPrevious()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row1.uuid])
        })

        it('shift click and select next', (): void => {
            setSelNode(row4)
            service.continuousSelect(row3)
            service.selectNext()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row2.uuid])
        })

        it('shift up and select previous', (): void => {
            setSelNode(row4)
            service.continuousSelectWithKeyboard(true)
            service.selectPrevious()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row3.uuid])
        })

        it('shift up and select next', (): void => {
            setSelNode(row4)
            service.continuousSelectWithKeyboard(true)
            service.selectNext()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([row5.uuid])
        })
    })

    // tslint:disable-next-line: max-func-body-length
    describe('col node test', (): void => {
        it('select all with col(under table) selected', (): void => {
            setSelNode(col1)
            service.selectAll()
            const infos = service.sels.get(activeSheet.name) ?? []
            const expectedIds = table1.cols.map(col => col.uuid)
            expect(getNodeIds(infos)).toEqual(expectedIds)
        })
        it('select all with col(under col block) selected', (): void => {
            setSelNode(col2)
            service.selectAll()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([col2.uuid, col3.uuid])
        })
        it('continuous select by shift click', (): void => {
            setSelNode(col3)
            service.continuousSelect(col1)
            let infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([col1.uuid, colBlock1.uuid])

            setSelNode(col5)
            service.continuousSelect(col6)
            infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([])
        })
        it('shift click and select previous', (): void => {
            setSelNode(col4)
            service.continuousSelect(col3)
            service.selectPrevious()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([col1.uuid])
        })
        it('shift click and select next', (): void => {
            setSelNode(col4)
            service.continuousSelect(col3)
            service.selectNext()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([col2.uuid])
        })

        it('shift up and select previous', (): void => {
            setSelNode(col4)
            service.continuousSelectWithKeyboard(true)
            service.selectPrevious()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([col3.uuid])
        })

        it('shift up and select next', (): void => {
            setSelNode(col4)
            service.continuousSelectWithKeyboard(true)
            service.selectNext()
            const infos = service.sels.get(activeSheet.name) ?? []
            expect(getNodeIds(infos)).toEqual([col5.uuid])
        })
    })
    function getNodeIds(infos: Readonly<NodeFocusInfo>[]): readonly string[] {
        return infos.map(info => info.nodeId)
    }

    function setSelNode(
        node: Readonly<Node>,
        slice?: SliceExpr,
        multi = false,
    ): void {
        const info = new NodeFocusInfoBuilder()
            .nodeId(node.uuid)
            .slice(slice)
            .build()
        const oldInfos = service.sels.get(activeSheet.name) ?? []
        const newInfos = multi ? [...oldInfos, info] : [info]
        service.sels.set(activeSheet.name, newInfos)
        service.lastSelected = info
    }
})
