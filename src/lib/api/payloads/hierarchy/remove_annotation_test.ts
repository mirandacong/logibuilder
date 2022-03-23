import {AnnotationKey, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {removeAnnotation} from './remove_annotation'

describe('add label handler test', (): void => {
    it('row', (): void => {
        const row = new RowBuilder()
            .name('row')
            .annotations(new Map([
                [AnnotationKey.LINK_CODE, 'value'],
                [AnnotationKey.LINK_NAME, 'value2'],
            ]))
            .build()
        removeAnnotation(row, AnnotationKey.LINK_CODE)
        expect(row.annotations.size).toBe(1)
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        expect(row.annotations.get(AnnotationKey.LINK_CODE)).toBe(undefined)
    })
})
