import {SheetBuilder} from '@logi/src/lib/hierarchy/core'

import {setName} from './set_name'

describe('set name payload handler', (): void => {
    it('sheet', (): void => {
        const sheet = new SheetBuilder().name('old').build()
        setName(sheet, 'new')
        expect(sheet.name).toBe('new')
    })
})
