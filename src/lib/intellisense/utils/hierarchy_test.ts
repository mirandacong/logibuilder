import {
    Book,
    BookBuilder,
    ColumnBlockBuilder,
    ColumnBuilder,
    Node,
    NodeType,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    findDecendants,
    findParent,
    getNodesDist,
    getRefnames,
    getRoot,
    getShortAlias,
} from './hierarchy'

describe('Walk Test', (): void => {
    it('getRefnames', (): void => { // tslint:disable-line: max-func-body-length
        const root = newtestBook()
        const expected: string[] = [
            'Book',
            'Sheet',
            'Title',
            'Table',
            'ColumnBlock',
            'RowBlock',
            'Column1',
            'Column2',
            'Column3',
            'Row1',
            'Row2',
            'Row3',
            'ColumnSelection',
            'RowSelection',
        ]
        const refnameArray = getRefnames(root)
        refnameArray.forEach((value: string, idx: number): void => {
            expect(value).toEqual(expected[idx])
        })
    })
    it('getDecendants', (): void => {
        const root = newtestBook()
        const result = findDecendants(root,
            (curr: Node, arg: string): boolean => curr.name.startsWith(arg)
            && !curr.name.endsWith('k'), 'R')
        expect(result.map((c: Readonly<Node>): string => c.name))
            .toEqual(['Row1', 'Row2', 'Row3'])
    })
    it('find parent', (): void => {
        const root = newtestBook()
        const node = findDecendants(root,
            (curr: Node, arg: string): boolean => curr.name === arg,
            'Row1')[0]
        const parent = findParent(node,
            (curr: Readonly<Node>, arg: NodeType): boolean =>
                curr.nodetype === arg,
            NodeType.SHEET)
        expect(parent.nodetype).toEqual(NodeType.SHEET)
    })
})

describe('Root Test', (): void => {
    it('getRoot', (): void => {
        const root = newtestBook()
        const nodes = findDecendants(root,
            (curr: Node, arg: string): boolean =>
            curr.name.startsWith(arg), 'R')
        nodes.forEach((node: Readonly<Node>): void => {
            const actual = getRoot(node)
            expect(actual).toEqual(root)
        })
    })
})

describe('node dist', (): void => {
    let root: Readonly<Book>
    beforeEach((): void => {
        root = newtestBook()
    })
    it('sibling', (): void => {
        const node1 = findDecendants(
            root,
            (curr: Readonly<Node>, arg: string): boolean => curr.name === arg,
            'Row1',
        )[0]
        const node2 = findDecendants(
            root,
            (curr: Readonly<Node>, arg: string): boolean => curr.name === arg,
            'Row2',
        )[0]
        const dist = getNodesDist(node1, node2)
        const expected = 2
        expect(dist).toBe(expected)
    })
    it('parent', (): void => {
        const node1 = findDecendants(
            root,
            (curr: Readonly<Node>, arg: string): boolean => curr.name === arg,
            'Row1',
        )[0]
        const node2 = findDecendants(
            root,
            (curr: Readonly<Node>, arg: string): boolean => curr.name === arg,
            'RowBlock',
        )[0]
        const dist = getNodesDist(node1, node2)
        expect(dist).toBe(1)
    })
})

describe('Short alias', (): void => {
    let book: Readonly<Book>
    let fn: (curr: Readonly<Node>, arg: string) => boolean
    beforeEach((): void => {
        book = getAliasTestBook()
        // tslint:disable-next-line: typedef
        fn = (curr: Readonly<Node>, arg: string) => curr.name === arg
    })
    it('simple', (): void => {
        const nodes = findDecendants(book, fn, 'Row1')
        const node1 = nodes[0]
        const alias1 = getShortAlias(node1)
        expect(alias1.length).toBe(1)
        expect(alias1[0][0]).toEqual('Row1[[R1]]')
        const node2 = nodes[1]
        const alias2 = getShortAlias(node2)
        // tslint:disable-next-line:no-magic-numbers
        expect(alias2.length).toBe(2)
        expect(alias2[0][0]).toEqual('Sheet[[Sh1]]')
        expect(alias2[1][0]).toEqual('Row1')
        const nodes2 = findDecendants(book, fn, 'Row2')
        const node3 = nodes2[0]
        const node4 = nodes2[1]
        const alias3 = getShortAlias(node3)
        // tslint:disable-next-line:no-magic-numbers
        expect(alias3.length).toBe(2)
        expect(alias3[0][0]).toEqual('Sheet[[Sh2]]')
        expect(alias3[1][0]).toEqual('Row2')
        const alias4 = getShortAlias(node4)
        // tslint:disable-next-line:no-magic-numbers
        expect(alias4.length).toBe(2)
        expect(alias4[0][0]).toEqual('Sheet[[Sh1]]')
        expect(alias4[1][0]).toEqual('Row2')
    })
})

// tslint:disable-next-line:max-func-body-length
function newtestBook(): Readonly<Book> {
    const bookNode = new BookBuilder().name('Book').build()
    const sheetNode = new SheetBuilder().name('Sheet').labels(['Sh1']).build()
    const tableNode = new TableBuilder()
        .name('Table')
        .labels(['Ta1', 'Ta2'])
        .build()
    const columnBlockNode = new ColumnBlockBuilder().name('ColumnBlock').build()
    const rowBlockNode = new RowBlockBuilder().name('RowBlock').build()
    const titleNode = new TitleBuilder().name('Title').build()
    bookNode.insertSubnode(sheetNode)
    sheetNode.insertSubnode(titleNode)
    titleNode.insertSubnode(tableNode)
    tableNode.insertSubnode(columnBlockNode)
    tableNode.insertSubnode(rowBlockNode)
    const colRowNum = 3
    for (let i = 1; i <= colRowNum; i += 1) {
        const name: string = 'Column'.concat(i.toString())
        const column = new ColumnBuilder().name(name).build()
        columnBlockNode.insertSubnode(column)
    }
    for (let i = 1; i <= colRowNum; i += 1) {
        const name: string = 'Row'.concat(i.toString())
        const row = new RowBuilder().name(name).build()
        rowBlockNode.insertSubnode(row)
    }

    return bookNode
}

function getAliasTestBook(): Readonly<Book> {
    const book = newtestBook()
    const sheet = new SheetBuilder().name('Sheet').labels(['Sh2']).build()
    book.insertSubnode(sheet)
    const table = new TableBuilder().name('Table').labels(['Ta3']).build()
    sheet.insertSubnode(table)
    const rowBlock = new RowBlockBuilder().name('RowBlock').build()
    table.insertSubnode(rowBlock)
    const row1 = new RowBuilder().name('Row1').labels(['R1']).build()
    const row2 = new RowBuilder().name('Row2').build()
    rowBlock.insertSubnode(row1)
    rowBlock.insertSubnode(row2)

    return book
}
