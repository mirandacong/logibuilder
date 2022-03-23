import {NodeType} from './node'
import {TableBuilder} from './table'
import {isTitle, Title, TitleBuilder} from './title'

describe('Book test', (): void => {
    it('Basic properties test', (): void => {
        const title = new TitleBuilder().name('example').tree([]).build()
        expect(isTitle(title)).toBe(true)
        expect(title.name).toBe('example')
        expect(title.tree.length).toBe(0)
        expect(title.nodetype).toEqual(NodeType.TITLE)
    })
    it('Title + title hierarchical relationship test', (): void => {
        const t1 = new TitleBuilder().name('t1').build()
        const t2 = new TitleBuilder().name('t2').build()
        const t3 = new TitleBuilder().name('t3').tree([t1, t2]).build()
        expect((t1.parent as Readonly<Title>).name).toBe('t3')
        expect((t2.parent as Readonly<Title>).name).toBe('t3')
        // tslint:disable-next-line:no-magic-numbers
        expect(t3.tree.length).toBe(2)
    })
    it('Title + table hierarchical relationship test', (): void => {
        const t1 = new TableBuilder().name('table1').subnodes([]).build()

        const t2 = new TableBuilder().name('table2').subnodes([]).build()
        const title = new TitleBuilder().name('title').tree([t1, t2]).build()
        expect((t1.parent as Readonly<Title>).name).toBe('title')
        expect((t2.parent as Readonly<Title>).name).toBe('title')
        // tslint:disable-next-line:no-magic-numbers
        expect(title.tree.length).toBe(2)
    })
})
