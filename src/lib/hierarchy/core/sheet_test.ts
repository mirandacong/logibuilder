import {NodeType} from './node'
import {isSheet, Sheet, SheetBuilder} from './sheet'
import {TableBuilder} from './table'

describe('Sheet test', (): void => {
    it('Basic properties test', (): void => {
        const s = new SheetBuilder().name('example').tree([]).build()
        expect(isSheet(s)).toBe(true)
        expect(s.name).toBe('example')
        expect(s.tree.length).toBe(0)
        expect(s.nodetype).toEqual(NodeType.SHEET)
    })
    it('Hierarchical relationship test', (): void => {
        const t1 = new TableBuilder().name('t1').build()
        const t2 = new TableBuilder().name('t2').build()
        const sheet = new SheetBuilder().name('sheet').tree([t1, t2]).build()
        expect((t1.parent as Readonly<Sheet>).name).toBe('sheet')
        expect((t2.parent as Readonly<Sheet>).name).toBe('sheet')
        // tslint:disable-next-line:no-magic-numbers
        expect(sheet.tree.length).toBe(2)
    })
})
