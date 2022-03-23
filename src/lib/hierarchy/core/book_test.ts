// tslint:disable:no-magic-numbers
import {Book, BookBuilder, isBook} from './book'
import {NodeType} from './node'
import {SheetBuilder} from './sheet'

// tslint:disable-next-line:max-func-body-length
describe('Book test', (): void => {
    it('Basic properties test', (): void => {
        const s = new BookBuilder().name('example').sheets([]).build()
        expect(isBook(s)).toBe(true)
        expect(s.name).toBe('example')
        expect(s.sheets.length).toBe(0)
        expect(s.nodetype).toEqual(NodeType.BOOK)
    })
    // tslint:disable-next-line:max-func-body-length
    it('Hierarchical relationship test', (): void => {
        const s1 = new SheetBuilder().name('t1').build()
        const s2 = new SheetBuilder().name('t2').build()
        const book = new BookBuilder().name('book').sheets([s1, s2]).build()
        expect((s1.parent as Readonly<Book>).name).toBe('book')
        expect((s2.parent as Readonly<Book>).name).toBe('book')
        expect(book.sheets.length).toBe(2)
    })
    // tslint:disable-next-line:max-func-body-length
    it('Insert test', (): void => {
        const s1 = new SheetBuilder().name('t1').build()
        const book = new BookBuilder().name('book').build()
        book.insertSubnode(s1)
        expect((s1.parent as Readonly<Book>).name).toBe('book')
        expect(book.sheets.length).toBe(1)
    })
    it('Delete test', (): void => {
        const s1 = new SheetBuilder().name('t1').build()
        const book = new BookBuilder().name('book').build()
        book.insertSubnode(s1)
        expect((s1.parent as Readonly<Book>).name).toBe('book')
        expect(book.sheets.length).toBe(1)
        book.deleteSubnode(s1)
        expect(book.sheets.length).toBe(0)
    })
    // tslint:disable-next-line:max-func-body-length
    it('Delete and insert test', (): void => {
        const s1 = new SheetBuilder().name('s1').build()
        const s2 = new SheetBuilder().name('s2').build()
        const s3 = new SheetBuilder().name('s3').build()
        const book = new BookBuilder().name('book').build()
        book.insertSubnode(s1)
        book.insertSubnode(s2)
        book.insertSubnode(s3)
        expect((s1.parent as Readonly<Book>).name).toBe('book')
        expect((s2.parent as Readonly<Book>).name).toBe('book')
        expect((s3.parent as Readonly<Book>).name).toBe('book')
        expect(book.sheets.length).toBe(3)
        expect(book.sheets[0].name).toBe('s1')
        expect(book.sheets[1].name).toBe('s2')
        expect(book.sheets[2].name).toBe('s3')
        book.deleteSubnode(s2)
        expect(book.sheets.length).toBe(2)
        expect(book.sheets[0].name).toBe('s1')
        expect(book.sheets[1].name).toBe('s3')
        book.insertSubnode(s2)
        expect(book.sheets.length).toBe(3)
        expect(book.sheets[0].name).toBe('s1')
        expect(book.sheets[1].name).toBe('s3')
        expect(book.sheets[2].name).toBe('s2')
        book.deleteSubnode(s1)
        expect(book.sheets.length).toBe(2)
        expect(book.sheets[0].name).toBe('s3')
        expect(book.sheets[1].name).toBe('s2')
        book.deleteSubnode(s3)
        expect(book.sheets.length).toBe(1)
        expect(book.sheets[0].name).toBe('s2')
        const s4 = new SheetBuilder().name('s4').build()
        book.deleteSubnode(s4)
    })
})
