import {DataType, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {setDataType} from './set_data_type'

describe('set data type payload handler', (): void => {
    it('row', (): void => {
        const row = new RowBuilder().name('row').isDefScalar(true).build()
        setDataType(row, DataType.NONE)
        expect(row.isDefScalar).toBe(false)
        setDataType(row, DataType.SCALAR)
        expect(row.isDefScalar).toBe(true)
        setDataType(row, DataType.STOCK)
        expect(row.labels).toEqual(['存量'])
        setDataType(row, DataType.FLOW)
        expect(row.labels).toEqual(['流量'])
    })
})
