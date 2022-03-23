import {
    BookBuilder,
    ColumnBuilder,
    NodeType,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {ViewType} from '@logi/src/lib/intellisense/editor/display'

import {
    Candidate,
    CandidateBuilder,
    CandidateHandleBuilder,
    CandidateType,
} from '../../suggest/solutions/candidate'

import {getCandidateText, processCandidate} from './process'

// tslint:disable-next-line: max-func-body-length
describe('process candidate', (): void => {
    it('refname row', (): void => {
        const cand1 = getRefCandidate(NodeType.ROW)
        const status = processCandidate(cand1)
        expect(status).toBeDefined()
        // tslint:disable: no-magic-numbers
        expect(status?.page.length).toBe(6)
        // tslint:disable: no-type-assertion
        const pathCand1 = status?.page[0].entity as Candidate
        expect(pathCand1.source).toBe(CandidateType.PROCESS_PATH)
        expect(pathCand1.view[0].type).toBe(ViewType.ANNOTATION)
        expect(pathCand1.view[1].type).toBe(ViewType.PATH)
        const pathCand2 = status?.page[1].entity as Candidate
        expect(pathCand2.source).toBe(CandidateType.PROCESS_PATH)
        expect(pathCand2.view[0].type).toBe(ViewType.PATH)
        const sel1Cand = status?.page[2].entity as Candidate
        expect(sel1Cand.source).toBe(CandidateType.PROCESS_SELECTION)
        expect(sel1Cand.view[0].content).toBe('foo')
        const sel2Cand = status?.page[3].entity as Candidate
        expect(sel2Cand.source).toBe(CandidateType.PROCESS_SELECTION)
        expect(sel2Cand.view[0].content).toBe('sel2')
        // tslint:disable-next-line: no-magic-numbers
        const sel3Cand = status?.page[4].entity as Candidate
        expect(sel3Cand.source).toBe(CandidateType.PROCESS_SELECTION)
        const sel4Cand = status?.page[5].entity as Candidate
        expect(sel4Cand.source).toBe(CandidateType.PROCESS_SELECTION)
    })
    it('refname col', (): void => {
        const cand1 = getRefCandidate(NodeType.COLUMN)
        const status = processCandidate(cand1)
        expect(status).toBeDefined()
        // tslint:disable: no-magic-numbers
        expect(status?.page.length).toBe(2)
        const sel1Cand = status?.page[1].entity as Candidate
        expect(sel1Cand.source).toBe(CandidateType.PROCESS_SELECTION)
        expect(sel1Cand.view[0].content).toBe('row')
    })
    it('path', (): void => {
        const cand1 = getPathCandidate()
        const status = processCandidate(cand1)
        expect(status).toBeDefined()
        // tslint:disable-next-line: no-magic-numbers
        expect(status?.page.length).toBe(2)
        const sel1Cand = status?.page[0].entity as Candidate
        expect(sel1Cand.source).toBe(CandidateType.PROCESS_SELECTION)
        const expr1 = '1 + {sheet!table!row}[sel1]'
        expect(`${sel1Cand.prefix}${sel1Cand.updateText}`).toBe(expr1)
        expect(sel1Cand.cursorOffset).toBe(expr1.length)
        const sel2Cand = status?.page[1].entity as Candidate
        expect(sel2Cand.source).toBe(CandidateType.PROCESS_SELECTION)
    })
    it('selectCandidate', (): void => {
        const cand = new CandidateBuilder()
            .view([])
            .prefix('{prefix} + ')
            .suffix(' + suffix()')
            .source(CandidateType.REFNAME)
            .updateText('{update}')
            .cursorOffest(19)
            .build()
        const txt = getCandidateText(cand)
        expect(txt.text).toEqual('{prefix} + {update} + suffix()'.split(''))
        // tslint:disable-next-line:no-magic-numbers
        expect(txt.endOffset).toBe(19)
    })
})

function getRefCandidate(baseType: NodeType): Candidate {
    const book = new BookBuilder().name('book').build()
    const sheet = new SheetBuilder().name('sheet').build()
    book.insertSubnode(sheet)
    const table = new TableBuilder().name('table').build()
    sheet.insertSubnode(table)
    const sel1 = new ColumnBuilder().labels(['foo']).name('sel1').build()
    const sel2 = new ColumnBuilder().name('sel2').build()
    const sel22 = new ColumnBuilder().name('sel2').build()
    table.insertSubnode(sel1)
    table.insertSubnode(sel2)
    table.insertSubnode(sel22)
    const row = new RowBuilder().name('row').build()
    table.insertSubnode(row)
    const table2 = new TableBuilder().name('table2').build()
    sheet.insertSubnode(table2)
    const row2 = new RowBuilder().name('row2').build()
    table2.insertSubnode(row2)
    const sel3 = new ColumnBuilder().name('sel1').build()
    const sel4 = new ColumnBuilder().name('sel3').build()
    table2.insertSubnode(sel3)
    table2.insertSubnode(sel4)
    return new CandidateBuilder()
        .view([])
        .updateText('value')
        .source(CandidateType.REFNAME)
        .handle(new CandidateHandleBuilder()
            .base(baseType === NodeType.ROW ? row : sel1)
            .nodes(baseType === NodeType.ROW ? [row, row2] : [sel2])
            .build(),
        )
        .build()
}

function getPathCandidate(): Candidate {
    const book = new BookBuilder().name('book').build()
    const sheet = new SheetBuilder().name('sheet').build()
    book.insertSubnode(sheet)
    const table = new TableBuilder().name('table').build()
    sheet.insertSubnode(table)
    const sel1 = new ColumnBuilder().name('sel1').build()
    const sel2 = new ColumnBuilder().name('sel2').build()
    table.insertSubnode(sel1)
    table.insertSubnode(sel2)
    const row = new RowBuilder().name('row').build()
    table.insertSubnode(row)
    return new CandidateBuilder()
        .view([])
        .prefix('1 + ')
        .updateText('path')
        .source(CandidateType.PROCESS_PATH)
        .handle(new CandidateHandleBuilder().nodes([row]).build())
        .build()
}
