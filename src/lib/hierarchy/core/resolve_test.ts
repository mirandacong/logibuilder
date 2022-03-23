// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {
    BookBuilder,
    PathBuilder,
    Row,
    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {resolve, simplifyPath} from './resolve'

// tslint:disable-next-line: max-func-body-length
describe('resolve test', (): void => {
    let r1: Readonly<Row>
    let r2: Readonly<Row>
    let r3: Readonly<Row>
    let r4: Readonly<Row>
    let r5: Readonly<Row>
    let r22: Readonly<Row>
    beforeEach((): void => {
        r1 = new RowBuilder().name('r1').build()
        r2 = new RowBuilder().name('r2').alias('1').build()
        r22 = new RowBuilder().name('r2').alias('2').build()
        r3 = new RowBuilder().name('r3').build()
        const rb = new RowBlockBuilder().name('rb').tree([r3]).build()
        r4 = new RowBuilder().name('r4').build()
        const t1 = new TableBuilder()
            .name('t1')
            .subnodes([r1, r2, r22, rb])
            .build()
        const t2 = new TableBuilder().name('t2').subnodes([r4]).build()
        const s1 = new SheetBuilder().name('s1').tree([t1, t2]).build()

        r5 = new RowBuilder().name('r5').build()
        const t3 = new TableBuilder().name('t3').subnodes([r5]).build()
        const s2 = new SheetBuilder().name('s2').tree([t3]).build()
        new BookBuilder().name('book').sheets([s1, s2]).build()
    })
    it('resolve test', (): void => {
        const path1 = PathBuilder.buildFromString('r2@1')
        expect(isException(path1)).toBe(false)
        if (isException(path1))
            return
        const nodes1 = resolve(path1, r1)
        expect(nodes1.length).toBe(1)
        expect(nodes1[0]).toBe(r2)

        const path2 = PathBuilder.buildFromString('rb!r3')
        expect(isException(path2)).toBe(false)
        if (isException(path2))
            return
        const nodes2 = resolve(path2, r1)
        expect(nodes2.length).toBe(1)
        expect(nodes2[0]).toBe(r3)

        const path3 = PathBuilder.buildFromString('t2!r4')
        expect(isException(path3)).toBe(false)
        if (isException(path3))
            return
        const nodes3 = resolve(path3, r1)
        expect(nodes3.length).toBe(1)
        expect(nodes3[0]).toBe(r4)

        const path4 = PathBuilder.buildFromString('s2!t3!r5')
        expect(isException(path4)).toBe(false)
        if (isException(path4))
            return
        const nodes4 = resolve(path4, r1)
        expect(nodes4.length).toBe(1)
        expect(nodes4[0]).toBe(r5)

        const path5 = PathBuilder.buildFromString('r5')
        expect(isException(path5)).toBe(false)
        if (isException(path5))
            return
        const nodes5 = resolve(path5, r1)
        expect(nodes5.length).toBe(0)
    })
    it('simplyfyPath', (): void => {
        const path = simplifyPath(r2, r1)
        expect(path.toString()).toBe('r2@1')
        expect(path.alias).toBe('1')
        expect(resolve(path, r1)).toEqual([r2])

        const path2 = simplifyPath(r22, r1)
        expect(path2.toString()).toBe('r2@2')
        expect(path2.alias).toBe('2')
        expect(resolve(path2, r1)).toEqual([r22])

        const path3 = simplifyPath(r1, r1)
        expect(path3.toString()).toBe('r1')
        expect(resolve(path3, r1)).toEqual([r1])

        const path4 = simplifyPath(r3, r1)
        expect(path4.toString()).toBe('rb!r3')
        expect(resolve(path4, r1)).toEqual([r3])

        const path5 = simplifyPath(r4, r1)
        expect(path5.toString()).toBe('t2!r4')
        expect(resolve(path5, r1)).toEqual([r4])

        const path6 = simplifyPath(r5, r1)
        expect(path6.toString()).toBe('s2!t3!r5')
        expect(resolve(path6, r1)).toEqual([r5])
    })
})
