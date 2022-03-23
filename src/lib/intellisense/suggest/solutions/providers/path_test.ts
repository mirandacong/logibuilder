// tslint:disable: no-magic-numbers
import {
    Book,
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    Label,
    Part,
    Path,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {Candidate, CandidateHandle} from '../candidate'
import {PathProvider} from '../providers/path'
import {TriggerBuilder, TriggerType} from '../trigger'

describe('path intellisense', (): void => {
    let book: Readonly<Book>
    let pathProvider: PathProvider
    beforeEach((): void => {
        book = newTestBook()
        pathProvider = new PathProvider()
    })
    // tslint:disable-next-line:max-func-body-length
    it('subsequence', (): void => {
        const trigger = new TriggerBuilder()
            .text('Tct')
            .node(book)
            .type(TriggerType.PATH)
            .build()
        const result = pathProvider.suggest(trigger)[0].members
        // Safe to use type assertion, because provider is PathProvider.
        const acutal = result.map((h: Candidate): string =>
            pathToString((h.handle as CandidateHandle).nodes[0].getPath()))
        acutal.forEach((p: string): void => {
            expect(p).toContain('Tecent')
        })
    })
    // tslint:disable-next-line:max-func-body-length
    it('multiple inputs', (): void => {
        const trigger = new TriggerBuilder()
            .text('heeT:TCt')
            .node(book)
            .type(TriggerType.PATH)
            .build()
        const result = pathProvider.suggest(trigger)[0].members
        const acutal = result.map((h: Candidate): string =>
            pathToString((h.handle as CandidateHandle).nodes[0].getPath()))
        acutal.forEach((p: string): void => {
            expect(p).toContain('Tecent')
            expect(p).toContain('Sheet')
        })
    })
    // tslint:disable-next-line:max-func-body-length
    it('reverse multiple inputs', (): void => {
        const trigger = new TriggerBuilder()
            .text('Tct:heet:Tile')
            .node(book)
            .type(TriggerType.PATH)
            .build()
        const result = pathProvider.suggest(trigger)[0].members
        const acutal = result.map((h: Candidate): string =>
            pathToString((h.handle as CandidateHandle).nodes[0].getPath()))
        acutal.forEach((p: string): void => {
            expect(p).toContain('Tecent')
            expect(p).toContain('Sheet')
            expect(p).toContain('Title')
        })
    })
})

function pathToString(path: Path): string {
    const results: string[] = []
    const parts = path.parts
    parts.forEach((p: Part): void => {
        results.push(sliceToString(p))
    })

    return results.join('/')
}

function sliceToString(slice: Part): string {
    // tslint:disable-next-line: typedef
    const labels = slice.labels.map((l: Label) => {
        if (typeof l === 'string')
            return [l]

        return l
    })

    return `${slice.name}@${labels.join('||')}`
}

// tslint:disable-next-line:max-func-body-length
function newTestBook(): Readonly<Book> {
    const bookNode = new BookBuilder()
        .name('Book')
        .labels(['BookLabel1'])
        .build()
    const sheetNode = new SheetBuilder().name('Sheet').build()
    const tableNode = new TableBuilder().name('Table').build()
    const columnBlockNode = new ColumnBlockBuilder()
        .name('ColumnBlock')
        .labels(['ColumnBlockLabel1', 'ColumnBlockLabel2'])
        .build()
    const rowBlockNode = new RowBlockBuilder().name('RowBlock').build()
    const titleNode = new TitleBuilder().name('Title').build()
    bookNode.insertSubnode(sheetNode)
    sheetNode.insertSubnode(titleNode)
    titleNode.insertSubnode(tableNode)
    tableNode.insertSubnode(columnBlockNode)
    tableNode.insertSubnode(rowBlockNode)
    const colRowNum = 3
    // tslint:disable-next-line: no-loop-statement
    for (let i = 1; i <= colRowNum; i += 1) {
        const name: string = 'Column'.concat(i.toString())
        const colBuilder = new ColumnBuilder().name(name)
        const column = i === 1 ?
            colBuilder.labels(['Tecent']).build() :
            colBuilder.build()
        columnBlockNode.insertSubnode(column)
    }
    // tslint:disable-next-line: no-loop-statement
    for (let i = 1; i <= colRowNum; i += 1) {
        const name: string = 'Row'.concat(i.toString())
        let row: Readonly<Row>
        if (i === 1)
            row = new RowBuilder()
                .name(name)
                .labels(['Alibaba', 'Baidu'])
                .build()
        else
            row = new RowBuilder().name(name).build()
        rowBlockNode.insertSubnode(row)
    }

    return bookNode
}
