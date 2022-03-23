// tslint:disable: no-magic-numbers
import {
    BookBuilder,
    Row,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    convertInnerOffset,
    convertOuterOffset,
    getRefTag,
    toOuterText,
} from './convert'
import {EditorDisplayUnit, EditorDisplayUnitBuilder} from './textbox/unit'
import {UnitType} from './textbox/unit_type'

describe('to outer text', (): void => {
    let row: Readonly<Row>
    beforeEach((): void => {
        row = new RowBuilder().name('row1').build()
        const table = new TableBuilder().name('table').subnodes([row]).build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        new BookBuilder().name('book').sheets([sheet]).build()
    })
    it('error expr', (): void => {
        const inner = ')))))))'.split('')
        const outer = toOuterText(inner, row)
        expect(outer.length).toBe(1)
        expect(outer[0].tags).toEqual([UnitType.UNRECOGNIZE_ERROR])
        const inner2 = '({row1}'.split('')
        const outer2 = toOuterText(inner2, row)
        expect(outer2.length).toBe(4)
        expect(outer2[0].tags).toEqual([UnitType.BRA])
        expect(outer2[3].tags)
            .toEqual([UnitType.REF_EXPR_ED, UnitType.EXPECTED_ERROR])
        const inner3 = '1 + 2 +'.split('')
        const outer3 = toOuterText(inner3, row)
        expect(outer3[outer3.length - 1].tags
            .includes(UnitType.UNEXPECTED_END_ERROR)).toBe(true)
    })
    it('common', (): void => {
        const inner = 'SUM({a}::{b}, 1)'.split('')
        const outer = toOuterText(inner, row)
        expect(outer.length).toBe(13)
    })
    it('function error', (): void => {
        const inner = 'XNPV({row1}, 1)'.split('')
        const outer = toOuterText(inner, row)
        expect(outer[0].tags.includes(UnitType.FUNC_ERROR)).toBe(true)
    })
})

describe('convert outter offset', (): void => {
    let unit1: EditorDisplayUnit
    let unit2: EditorDisplayUnit
    const content: (string | EditorDisplayUnit)[] = []
    beforeEach((): void => {
        unit1 = new EditorDisplayUnitBuilder()
            .indivisible(true)
            .content('unit1')
            .tags([])
            .build()
        unit2 = new EditorDisplayUnitBuilder()
            .indivisible(true)
            .content('unit2')
            .tags([])
            .build()
        content.push(...'inner text'.split(''))
        content.push(unit1)
        content.push(...'text2'.split(''))
        content.push(unit2)
    })
    it('outter', (): void => {
        const offset = 17
        const outter = convertOuterOffset(content, offset)
        // tslint:disable-next-line: no-magic-numbers
        expect(outter).toBe(25)
    })
})

describe('convert inner offset', (): void => {
    it('inner', (): void => {
        const unit1 = new EditorDisplayUnitBuilder()
            .indivisible(false)
            .content('row1')
            .buffer('{row1}')
            .tags([UnitType.READ_BUFFER, UnitType.REF])
            .build()
        const unit2 = new EditorDisplayUnitBuilder()
            .indivisible(false)
            .content('+')
            .tags([UnitType.OP])
            .build()
        const unit3 = new EditorDisplayUnitBuilder()
            .indivisible(false)
            .content('row2')
            .buffer('{row2}')
            .tags([UnitType.READ_BUFFER, UnitType.REF])
            .build()
        const content: EditorDisplayUnit[] = [unit1, unit2, unit3]
        const outer1 = 2
        const inner1 = convertInnerOffset(content, outer1)
        expect(inner1).toBeGreaterThanOrEqual(outer1)
        // tslint:disable-next-line: no-magic-numbers
        expect(inner1).toBeLessThan(5)
        const outer2 = 5 // row1+|row2
        const inner2 = convertInnerOffset(content, outer2)
        // tslint:disable-next-line: no-magic-numbers
        expect(inner2).toBe(7) // {row1}+|{row2}
        const outer3 = 0 // |row1+row2
        const inner3 = convertInnerOffset(content, outer3)
        expect(inner3).toBe(0) // |{row1}+{row2}
        const outer4 = 4 // row1|+row2
        const inner4 = convertInnerOffset(content, outer4)
        // tslint:disable-next-line: no-magic-numbers
        expect(inner4).toBe(6) // {row1}|+{row2}
    })
})

describe('get ref tag', (): void => {
    let base: Readonly<Row>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let row3: Readonly<Row>
    beforeEach((): void => {
        const book = new BookBuilder().name('book').build()
        const sheet1 = new SheetBuilder().name('sheet1').build()
        const sheet2 = new SheetBuilder().name('sheet2').build()
        book.insertSubnode(sheet1)
        book.insertSubnode(sheet2)
        const table1 = new TableBuilder().name('table1').build()
        const table2 = new TableBuilder().name('table2').build()
        const table3 = new TableBuilder().name('table3').build()
        sheet1.insertSubnode(table1)
        sheet1.insertSubnode(table2)
        sheet2.insertSubnode(table3)
        base = new RowBuilder().name('base').build()
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        row3 = new RowBuilder().name('row3').build()
        table1.insertSubnode(base)
        table1.insertSubnode(row1)
        table2.insertSubnode(row2)
        table3.insertSubnode(row3)
    })
    it('self', (): void => {
        expect(getRefTag(base, base)).toBe(UnitType.SELF)
    })
    it('this table', (): void => {
        expect(getRefTag(row1, base)).toBe(UnitType.THIS_TABLE)
    })
    it('this sheet', (): void => {
        expect(getRefTag(row2, base)).toBe(UnitType.THIS_SHEET)
    })
    it('other sheet', (): void => {
        expect(getRefTag(row3, base)).toBe(UnitType.OTHER_SHEET)
    })
})
