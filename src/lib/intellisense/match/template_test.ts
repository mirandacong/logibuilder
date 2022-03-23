import {isException} from '@logi/base/ts/common/exception'
import {PathBuilder} from '@logi/src/lib/hierarchy/core'

import {matchTemplateRef} from './template'

describe('match', (): void => {
    it('match', (): void => {
        const path = PathBuilder.buildFromString('book!sheet!table!row1')
        expect(isException(path)).toBe(false)
        if (isException(path))
            return
        const templateRef = 'sheet!table!row1'
        const confidence = matchTemplateRef(path, templateRef)
        expect(confidence).toBeGreaterThan(0)
    })
})
