// tslint:disable:no-magic-numbers
import {
    Book,
    BookBuilder,
    ColumnBlockBuilder,
    Node,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    ViewPartBuilder,
} from '@logi/src/lib/intellisense/editor/display/panel/part'
import {findDecendants, initializeMap} from '@logi/src/lib/intellisense/utils'

import {ViewType} from '../../editor/display/panel/part_type'

import {
    Candidate,
    CandidateBuilder,
    CandidateHandleBuilder,
    CandidateType,
} from './candidate'
import {getSubstringLenth, sortCandidates} from './sort'

describe('comparer', (): void => {
    let root: Readonly<Book>
    let findNode: (curr: Readonly<Node>, arg: string) => boolean
    let node1: Readonly<Node>
    let node2: Readonly<Node>
    let node3: Readonly<Node>
    const cursor = 0
    beforeEach((): void => {
        root = newTestBook()
        findNode = (
            curr: Readonly<Node>,
            arg: string,
        ): boolean => curr.name === arg
        node1 = findDecendants(root, findNode, 'Alibaba')[0]
        node2 = findDecendants(root, findNode, 'RowBlock')[0]
        node3 = findDecendants(root, findNode, 'Title')[0]
    })
    // tslint:disable-next-line:max-func-body-length
    it('map', (): void => {
        const map1 = initializeMap([
            [1, 2],
            [2, 3],
            [4, 5],
        ])
        const view1 = new ViewPartBuilder()
            .content('test1')
            .type(ViewType.UNKNOWN)
            .matchedMap(map1)
            .build()
        const cand1 = new CandidateBuilder()
            .view([view1])
            .source(CandidateType.REFNAME)
            .updateText('')
            .cursorOffest(cursor)
            .handle(new CandidateHandleBuilder().nodes([node1]).build())
            .build()
        const map2 = initializeMap([
            [1, 1],
            [2, 3],
            [3, 4],
        ])
        const view2 = new ViewPartBuilder()
            .content('test2')
            .matchedMap(map2)
            .type(ViewType.UNKNOWN)
            .build()
        const cand2 = new CandidateBuilder()
            .view([view2])
            .source(CandidateType.REFNAME)
            .updateText('')
            .cursorOffest(cursor)
            .handle(new CandidateHandleBuilder().nodes([node2]).build())
            .build()
        const result = [cand1, cand2].sort((a: Candidate, b: Candidate):
                number => sortCandidates(a, b, node3))
        expect(result[0]).toBe(cand2)
    })
    // tslint:disable-next-line:max-func-body-length
    it('dist', (): void => {
        const map1 = initializeMap([
            [1, 2],
            [3, 4],
            [4, 5],
        ])
        const view1 = new ViewPartBuilder()
            .content('test1')
            .type(ViewType.UNKNOWN)
            .matchedMap(map1)
            .build()
        const cand1 = new CandidateBuilder()
            .view([view1])
            .source(CandidateType.REFNAME)
            .updateText('')
            .cursorOffest(cursor)
            .handle(new CandidateHandleBuilder().nodes([node1]).build())
            .build()
        const view2 = new ViewPartBuilder()
            .content('test2')
            .matchedMap(map1)
            .type(ViewType.UNKNOWN)
            .build()
        const cand2 = new CandidateBuilder()
            .view([view2])
            .source(CandidateType.REFNAME)
            .cursorOffest(cursor)
            .updateText('')
            .handle(new CandidateHandleBuilder().nodes([node2]).build())
            .build()
        const result = [cand1, cand2].sort((a: Candidate, b: Candidate):
                number => sortCandidates(a, b, node3))
        expect(result[0]).toBe(cand2)
    })
    it('sort', (): void => {
        const map1 = initializeMap([
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
        ])
        const view1 = new ViewPartBuilder()
            .content('test1')
            .matchedMap(map1)
            .type(ViewType.UNKNOWN)
            .build()
        const cand1 = new CandidateBuilder()
            .view([view1])
            .source(CandidateType.REFNAME)
            .cursorOffest(cursor)
            .handle(new CandidateHandleBuilder().nodes([node1]).build())
            .build()
        const map2 = initializeMap([
            [0, 0],
            [1, 1],
            [2, 3],
            [3, 4],
        ])
        const view2 = new ViewPartBuilder()
            .content('test2')
            .type(ViewType.UNKNOWN)
            .matchedMap(map2)
            .build()
        const cand2 = new CandidateBuilder()
            .view([view2])
            .source(CandidateType.REFNAME)
            .cursorOffest(cursor)
            .handle(new CandidateHandleBuilder().nodes([node2]).build())
            .build()
        const result = [cand1, cand2].sort((a: Candidate, b: Candidate):
                number => sortCandidates(a, b, node3))
        expect(result[0]).toBe(cand1)
    })
})

describe('length of substring', (): void => {
    it('common', (): void => {
        const map1 = initializeMap([
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
        ])
        const len1 = getSubstringLenth(map1)
        expect(len1).toBe(4)
        const map2 = initializeMap([
            [0, 0],
            [1, 1],
            [2, 3],
            [3, 4],
        ])
        const len2 = getSubstringLenth(map2)
        expect(len2).toBe(2)
    })
})

function newTestBook(): Readonly<Book> {
    const bookNode = new BookBuilder().name('Book').labels(['l2']).build()
    const sheetNode = new SheetBuilder().name('AICID').build()
    const tableNode = new TableBuilder().name('Table').build()
    const columnBlockNode = new ColumnBlockBuilder().name('ColumnBlock').build()
    const rowBlockNode = new RowBlockBuilder().name('RowBlock').build()
    const titleNode = new TitleBuilder().name('Title').build()
    const row = new RowBuilder().name('Alibaba').labels(['label1']).build()
    bookNode.insertSubnode(sheetNode)
    sheetNode.insertSubnode(titleNode)
    titleNode.insertSubnode(tableNode)
    tableNode.insertSubnode(columnBlockNode)
    tableNode.insertSubnode(rowBlockNode)
    rowBlockNode.insertSubnode(row)

    return bookNode
}
