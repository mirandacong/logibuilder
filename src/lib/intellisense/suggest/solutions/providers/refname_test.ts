// tslint:disable: no-magic-numbers
import {
    BookBuilder,
    Column,
    ColumnBlockBuilder,
    ColumnBuilder,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'
import {lcsLenMatch} from '@logi/src/lib/intellisense/algo'

import {CandidateType} from '../candidate'
import {Provider} from '../provider'
import {TriggerBuilder, TriggerType} from '../trigger'

import {BaseProviderBuilder} from './refname'

// tslint:disable-next-line: max-func-body-length
describe('ref name provider', (): void => {
    let row1: Readonly<Row>
    let col1: Readonly<Column>
    let provider: Provider
    beforeEach((): void => {
        const bookNode = new BookBuilder().name('Book').build()
        const sheetNode = new SheetBuilder().name('Sheet').build()
        const tableNode = new TableBuilder().name('Table').build()
        col1 = new ColumnBuilder().name('col1').build()
        const col2 = new ColumnBuilder().name('col2').build()
        const col3 = new ColumnBuilder().name('col3').build()
        const columnBlockNode = new ColumnBlockBuilder()
            .name('ColumnBlock')
            .tree([col1, col2, col3])
            .build()
        row1 = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder().name('row2').build()
        const row3 = new RowBuilder().name('row3').build()
        const rowBlockNode = new RowBlockBuilder()
            .name('RowBlock')
            .tree([row1, row2, row3])
            .build()
        const titleNode = new TitleBuilder().name('Title').build()
        bookNode.insertSubnode(sheetNode)
        sheetNode.insertSubnode(titleNode)
        titleNode.insertSubnode(tableNode)
        tableNode.insertSubnode(columnBlockNode)
        tableNode.insertSubnode(rowBlockNode)

        const group1 = new RowBuilder().name('group candidate1').build()
        const group2 = new RowBuilder().name('candidate2 group').build()
        const group3 = new RowBuilder().name('candidate3 group').build()
        rowBlockNode.insertSubnode(group1)
        rowBlockNode.insertSubnode(group2)
        rowBlockNode.insertSubnode(group3)
        provider = new BaseProviderBuilder()
            .fn(lcsLenMatch)
            .source(CandidateType.REFNAME)
            .build()
    })
    it('match row', (): void => {
        const trigger = new TriggerBuilder()
            .node(row1)
            .text('candidate3')
            .prefix('{A}+')
            .type(TriggerType.REFERENCE)
            .build()
        const result = provider.suggest(trigger)
        expect(result[0].members.length).toBe(1)
        const candidate = result[0].members[0]
        expect(candidate.handle?.base).toBeDefined()
        expect(candidate.view[0].content).toBe('candidate3 group')
        const expectedText = candidate.prefix +
            candidate.updateText + candidate.suffix
        expect(expectedText).toEqual('{A}+{candidate3 group}')
        expect(candidate.cursorOffset).toBe(expectedText.length)
    })
    it('match col', (): void => {
        const trigger = new TriggerBuilder()
            .node(col1)
            .text('3')
            .prefix('{A}+')
            .type(TriggerType.REFERENCE)
            .build()
        const result = provider.suggest(trigger)
        expect(result[0].members.length).toBe(1)
        const candidate = result[0].members[0]
        expect(candidate.handle?.base).toBeDefined()
        expect(candidate.view[0].content).toBe('col3')
        const expectedText = candidate.prefix +
            candidate.updateText + candidate.suffix
        expect(expectedText).toEqual('{A}+{col3}')
        expect(candidate.cursorOffset).toBe(expectedText.length)
    })
})
