import {RowBuilder, Type} from '@logi/src/lib/hierarchy/core'

import {setType} from './set_type'

describe('set expression payload handler test', (): void => {
    it('row', (): void => {
        const row = new RowBuilder().name('row').expression('expr').build()
        expect(row.type).toBe(Type.FX)
        setType(row, Type.ASSUMPTION)
        expect(row.type).toBe(Type.ASSUMPTION)
        setType(row, Type.FACT)
        expect(row.type).toBe(Type.FACT)
    })
})
