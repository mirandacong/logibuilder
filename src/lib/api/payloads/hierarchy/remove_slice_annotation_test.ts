import {
    AnnotationKey,
    RowBuilder,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {removeSliceAnnotation} from './remove_slice_annotation'

describe('add label handler test', (): void => {
    it('row', (): void => {
        const slice = new SliceExprBuilder()
            .name('')
            .annotations(new Map([
                [AnnotationKey.LINK_NAME, 'name'],
                [AnnotationKey.LINK_CODE, 'code'],
            ]))
            .build()
        const row = new RowBuilder().name('row').sliceExprs([slice]).build()
        removeSliceAnnotation(row, 0, AnnotationKey.LINK_CODE)
        const newSlice = row.sliceExprs[0]
        expect(newSlice.annotations.size).toBe(1)
        expect(newSlice.annotations.get(AnnotationKey.LINK_CODE))
            .toBeUndefined()
    })
})
