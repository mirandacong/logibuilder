import {AnnotationKey, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {setAnnotation} from './set_annotation'

describe('add label handler test', (): void => {
    it('row', (): void => {
        const row = new RowBuilder().name('row').build()
        setAnnotation(row, AnnotationKey.LINK_CODE, 'value')
        expect(row.annotations.size).toBe(1)
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        expect(row.annotations.get(AnnotationKey.LINK_CODE)).toBe('value')
    })
})
