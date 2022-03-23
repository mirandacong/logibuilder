import {SliceExprBuilder, Type} from './slice_expr'

describe('Slice test', (): void => {
    it('Slice test1', (): void => {
        const slice = new SliceExprBuilder()
            .name('hist')
            .expression('')
            .type(Type.FACT)
            .build()
        expect(slice.expression).toBe('')
        expect(slice.name).toBe('hist')
        expect(slice.type).toBe(Type.FACT)
    })
    it('Slice test2', (): void => {
        const slice = new SliceExprBuilder().name('hist').build()
        expect(slice.expression).toBe('')
        expect(slice.type).toBe(Type.FX)
        expect(slice.name).toBe('hist')
    })
    it('Slice test2', (): void => {
        expect((): unknown => new SliceExprBuilder().build()).toThrow()
    })
})
