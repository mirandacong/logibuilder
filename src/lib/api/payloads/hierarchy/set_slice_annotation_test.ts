import {
    AnnotationKey,
    RowBuilder,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {setSliceAnnotation} from './set_slice_annotation'

describe('add label handler test', (): void => {
    it('row', (): void => {
        const slice = new SliceExprBuilder()
            .name('')
            .annotations(new Map([[AnnotationKey.LINK_NAME, 'name']]))
            .build()
        const row = new RowBuilder().name('row').sliceExprs([slice]).build()
        setSliceAnnotation(row, 0, AnnotationKey.LINK_CODE, 'value')
        const newSlice = row.sliceExprs[0]
        // tslint:disable-next-line: no-magic-numbers
        expect(newSlice.annotations.size).toBe(2)
        expect(newSlice.annotations.get(AnnotationKey.LINK_CODE)).toBe('value')
    })
})
