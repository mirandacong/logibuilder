import {getReplacedBooks} from './get_replaced_books'

describe('get replaced books test', (): void => {
    it('get replaced books test', (): void => {
        const books = getReplacedBooks()
        // tslint:disable-next-line: no-magic-numbers
        expect(books.length).toBe(8)
    })
})
