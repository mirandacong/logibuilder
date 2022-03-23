import {ColumnBlockBuilder, TableBuilder} from '@logi/src/lib/hierarchy/core'

import {setRefHeader} from './set_ref_header'

describe('set ref header payload handler', (): void => {
    it('table', (): void => {
        const table = new TableBuilder().name('table').build()
        const sharedCols = new ColumnBlockBuilder().name('share').build()
        setRefHeader(table, sharedCols.uuid)
        expect(table.referenceHeader).toBe(sharedCols.uuid)
        setRefHeader(table)
        expect(table.referenceHeader).toBeUndefined()
    })
})
