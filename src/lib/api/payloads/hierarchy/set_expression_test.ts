import {RowBuilder} from '@logi/src/lib/hierarchy/core'

import {setExpression} from './set_expression'

describe('set expression payload handler test', (): void => {
    it('row', (): void => {
        const row = new RowBuilder().name('row').expression('expr').build()
        setExpression(row, 'expression')
        expect(row.expression).toBe('expression')
        setExpression(row, 'test')
        expect(row.expression).toBe('test')
    })
})
