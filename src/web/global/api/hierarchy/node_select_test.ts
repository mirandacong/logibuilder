import {
    BookBuilder,
    ColumnBuilder,
    Row,
    RowBlock,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    Table,
    TableBuilder,
    Title,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    getAllNodesBetween,
    getNextNode,
    getNextNodeInPreOreder,
    getPrevNode,
    getPrevNodeInPreOrder,
} from './node_select'

// tslint:disable-next-line: max-func-body-length
describe('test lib', (): void => {
    let r1: Readonly<Row>
    let r2: Readonly<Row>
    let r3: Readonly<Row>
    let r4: Readonly<Row>
    let r5: Readonly<Row>
    let r6: Readonly<Row>
    let r7: Readonly<Row>
    let r8: Readonly<Row>
    let r9: Readonly<Row>
    let r10: Readonly<Row>
    let rb1: Readonly<RowBlock>
    let rb2: Readonly<RowBlock>
    let rb3: Readonly<RowBlock>
    let title: Readonly<Title>
    let table1: Readonly<Table>
    let table2: Readonly<Table>

    /**
     * book --- sheet --- table1 --- rb1 --- r1
     *                                  --- r2
     *                          --- r3
     *                          --- r4
     *                          --- rb2
     *                                  --- r5
     *                                  --- r6
     *                          --- r7
     *                --- title
     *                --- table2
     *                          --- rb3
     *                                  --- r8
     *                                  --- r9
     *                          --- r10
     */
    beforeEach((): void => {
        r1 = new RowBuilder().name('r1').build()
        r2 = new RowBuilder().name('r2').build()
        r3 = new RowBuilder().name('r3').build()
        r4 = new RowBuilder().name('r4').build()
        r5 = new RowBuilder().name('r5').build()
        r6 = new RowBuilder().name('r6').build()
        r7 = new RowBuilder().name('r7').build()
        r8 = new RowBuilder().name('r8').build()
        r9 = new RowBuilder().name('r9').build()
        r10 = new RowBuilder().name('r10').build()

        rb1 = new RowBlockBuilder().name('rb1').tree([r1, r2]).build()
        rb2 = new RowBlockBuilder().name('rb2').tree([r5, r6]).build()
        rb3 = new RowBlockBuilder().name('rb3').tree([r8, r9]).build()

        const col = new ColumnBuilder().name('col').build()
        table1 = new TableBuilder()
            .name('table1')
            .subnodes([col, rb1, r3, r4, rb2, r7])
            .build()
        title = new TitleBuilder().name('title').build()
        table2 = new TableBuilder().name('table2').subnodes([rb3, r10]).build()
        const sheet = new SheetBuilder()
            .name('sheet')
            .tree([table1, title, table2])
            .build()
        new BookBuilder().name('book').sheets([sheet]).build()
    })

    it('getPrevNodeInPreOrder', (): void => {
        const node1 = getPrevNodeInPreOrder(r5)
        expect(node1).toBe(rb2)
        const node2 = getPrevNodeInPreOrder(rb2)
        expect(node2).toBe(r4)
        const node3 = getPrevNodeInPreOrder(rb1)
        expect(node3).toBe(table1)
        const node4 = getPrevNodeInPreOrder(title)
        expect(node4).toBe(r7)
        const node5 = getPrevNodeInPreOrder(r10)
        expect(node5).toBe(r9)
    })

    it('getNextNodeInPreOrder', (): void => {
        const node1 = getNextNodeInPreOreder(table1)
        expect(node1).toBe(rb1)
        const node2 = getNextNodeInPreOreder(r1)
        expect(node2).toBe(r2)
        const node3 = getNextNodeInPreOreder(r2)
        expect(node3).toBe(r3)
        const node4 = getNextNodeInPreOreder(r7)
        expect(node4).toBe(title)
        const node5 = getNextNodeInPreOreder(r10)
        expect(node5).toBeUndefined()
    })

    it('getPrevNode', (): void => {
        const node1 = getPrevNode(rb1)
        expect(node1).toBe(table1)
        const node2 = getPrevNode(r1)
        expect(node2).toBe(rb1)
        const node3 = getPrevNode(r2)
        expect(node3).toBe(r1)
        const node4 = getPrevNode(r3)
        expect(node4).toBe(rb1)
        const node5 = getPrevNode(r5)
        expect(node5).toBe(rb2)
        const node6 = getPrevNode(title)
        expect(node6).toBe(table1)
    })

    it('getNextNode', (): void => {
        const node1 = getNextNode(rb1)
        expect(node1).toBe(r3)
        const node2 = getNextNode(r1)
        expect(node2).toBe(r2)
        const node3 = getNextNode(r2)
        expect(node3).toBe(rb1)
        const node4 = getNextNode(r3)
        expect(node4).toBe(r4)
        const node5 = getNextNode(rb2)
        expect(node5).toBe(r7)
        const node6 = getNextNode(title)
        expect(node6).toBe(table2)
    })

    it('getAllNodesBetween', (): void => {
        const nodes1 = getAllNodesBetween(r1, r4)
        expect(nodes1).toEqual([rb1, r3, r4])
        const nodes2 = getAllNodesBetween(r4, r1)
        expect(nodes2).toEqual([rb1, r3, r4])
        const nodes3 = getAllNodesBetween(r5, r2)
        expect(nodes3).toEqual([rb1, r3, r4, rb2])
        /**
         * Do not support select rows between different table.
         */
        const nodes4 = getAllNodesBetween(r8, r4)
        expect(nodes4.length).toBe(0)
        const nodes5 = getAllNodesBetween(r8, table2)
        expect(nodes5.length).toBe(0)
        const nodes6 = getAllNodesBetween(table2, table1)
        expect(nodes6).toEqual([table1, title, table2])
    })
})
