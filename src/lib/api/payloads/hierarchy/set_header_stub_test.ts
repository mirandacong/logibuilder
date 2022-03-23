import {TableBuilder} from '@logi/src/lib/hierarchy/core'

import {setHeader} from './set_header_stub'

describe('set header stub hanlder test', (): void => {
    it('table', (): void => {
        const table = new TableBuilder().name('table').headerStub('').build()
        const stub = 'new'
        setHeader(table, stub)
        expect(table.headerStub).toBe(stub)
    })
})
