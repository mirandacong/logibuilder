import {
    Book,
    BookBuilder,
    Column,
    ColumnBuilder,
    Label,
    Row,
    RowBuilder,
    Sheet,
    SheetBuilder,
    Table,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {getBookLabels, getNodesLabel} from './get_labels'
// tslint:disable-next-line: max-func-body-length
describe('get undefined references test', (): void => {
    let sheet: Readonly<Sheet>
    let table: Readonly<Table>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let row3: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let book: Readonly<Book>
    beforeEach((): void => {
        row1 = new RowBuilder().name('row1').labels(['1', '3']).build()
        row2 = new RowBuilder().name('row2').labels(['1', '2']).build()
        row3 = new RowBuilder().name('row3').labels(['2', '3']).build()
        col1 = new ColumnBuilder().name('col1').labels(['5', '4']).build()
        col2 = new ColumnBuilder().name('col2').labels(['6', '5']).build()
        col3 = new ColumnBuilder().name('col3').labels(['4', '6']).build()
        table = new TableBuilder()
            .name('table1')
            .subnodes([row1, row2, row3, col1, col2, col3])
            .build()
        sheet = new SheetBuilder().name('sheet').tree([table]).build()
        book = new BookBuilder().name('book').sheets([sheet]).build()
    })
    // tslint:disable-next-line: max-func-body-length
    it('get label info test', (): void => {
        const results = getBookLabels(book)
        const mapLength = 2
        expect(results.length).toBe(mapLength)
        type DataType = [Label, string[] ]
        const expectedRowData: DataType[] = [
            [
                '1',
               [row1.uuid, row2.uuid],
            ],
            [
                '3',
                [row1.uuid, row3.uuid],
            ],
            [
                '2',
                [row2.uuid, row3.uuid],
            ],
        ]
        const expectedColData: DataType[] = [
            [
                '5',
                [col1.uuid, col2.uuid],
            ],
            [
                '4',
                [col1.uuid, col3.uuid],
            ],
            [
                '6',
                [col2.uuid, col3.uuid],
            ],
        ]
        const rowLabel = results[0]
        const colLabel = results[1]
        let i = 0
        rowLabel.forEach((value: readonly string[], key: Label): void => {
            expect(key).toBe(expectedRowData[i][0])
            value.forEach((id: string, index: number): void => {
                expect(id).toBe(expectedRowData[i][1][index])
            })
            i += 1
        })
        i = 0
        colLabel.forEach((value: readonly string[], key: Label): void => {
            expect(key).toBe(expectedColData[i][0])
            value.forEach((id: string, index: number): void => {
                expect(id).toBe(expectedColData[i][1][index])
            })
            i += 1
        })

        const nodesLabel = getNodesLabel([row1, row2, row3, col1, col2, col3])
        expect(nodesLabel).toEqual(['1', '3', '2', '5', '4', '6'])
    })
})
