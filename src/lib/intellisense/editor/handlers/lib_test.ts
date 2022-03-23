import {
    BookBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    EditorDisplayUnit,
    toOuterText,
    UnitType,
} from '@logi/src/lib/intellisense/editor/display'

import {TextStatusBuilder} from '../status/textbox'

import {getBlurDisplay, traceReference} from './lib'

// tslint:disable-next-line: max-func-body-length
describe('focus handler', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('get blur display', (): void => {
        const book = new BookBuilder().name('dummy').build()
        const sheet = new SheetBuilder().name('dummy2').build()
        const table = new TableBuilder().name('dummy3').build()
        const row = new RowBuilder().name('dummy4').build()
        book.insertSubnode(sheet)
        sheet.insertSubnode(table)
        table.insertSubnode(row)
        const expr = '{a!b}'
        const outer1 = toOuterText(expr.split(''), row)
        const result = getBlurDisplay(outer1)
        expect(getContent(result)).toBe('b')
        expect(getBuffer(result)).toBe(expr)
        expect(result[0].tags.includes(UnitType.READ_BUFFER)).toBe(true)
        const expr2 = '{sales}+'
        const outer2 = toOuterText(expr2.split(''), row)
        const result2 = getBlurDisplay(outer2)
        // tslint:disable-next-line: no-magic-numbers
        expect(result2.length).toBe(2)
        expect(result2[0].tags.includes(UnitType.UNDEFINED_REF)).toBe(true)
        expect(result2[0].hoverInfo.message).toBe('未定义引用')
        const expr3 = '{a[[label]]}'
        const outer3 = toOuterText(expr3.split(''), row)
        const result3 = getBlurDisplay(outer3)
        expect(getContent(result3)).toBe('a[[label]]')
        expect(getBuffer(result3)).toBe(expr3)
        const expr4 = 'SUM()'
        const outer4 = toOuterText(expr4.split(''), row)
        const result4 = getBlurDisplay(outer4)
        expect(result4[0].tags.includes(UnitType.FUNC_ERROR)).toBe(true)
        expect(result4[0].hoverInfo.message).not.toBe('')
        const expr5 = '{a}.lag(1)'
        const outer5 = toOuterText(expr5.split(''), row)
        const result5 = getBlurDisplay(outer5)
        // tslint:disable: no-magic-numbers
        expect(result5[2].tags.includes(UnitType.FUNC_ERROR)).toBe(false)
        const expr6 = '{a}.lag()'
        const outer6 = toOuterText(expr6.split(''), row)
        const result6 = getBlurDisplay(outer6)
        expect(result6[1].tags.includes(UnitType.FUNC_ERROR)).toBe(true)
        const expr7 = 'foo()'
        const outer7 = toOuterText(expr7.split(''), row)
        const result7 = getBlurDisplay(outer7)
        expect(result7[0].tags.includes(UnitType.FUNC_ERROR)).toBe(true)
        const expr8 = 'POWER(1,,)'
        const outer8 = toOuterText(expr8.split(''), row)
        const result8 = getBlurDisplay(outer8)
        expect(result8[0].tags.includes(UnitType.FUNC_ERROR)).toBe(true)
        const expr9 = '{c!d!a[[label]]}'
        const outer9 = toOuterText(expr9.split(''), row)
        const result9 = getBlurDisplay(outer9)
        expect(getBuffer(result9)).toBe(expr9)
        expect(getContent(result9)).toBe('a[[label]]')
        const expr10 = '{a}'
        const outer10 = toOuterText(expr10.split(''), row)
        const result10 = getBlurDisplay(outer10)
        expect(getBuffer(result10)).toBe(expr10)
        expect(getContent(result10)).toBe('a')
        const expr11 = '{b!c!d!a}'
        const outer11 = toOuterText(expr11.split(''), row)
        const result11 = getBlurDisplay(outer11)
        expect(getBuffer(result11)).toBe(expr11)
        expect(getContent(result11)).toBe('a')
    })
    it('lint function and menthod name', (): void => {
        const node = new RowBuilder().name('').build()
        const expr1 = 'sum()'
        const outer1 = toOuterText(expr1.split(''), node)
        const res1 = getBlurDisplay(outer1)
        expect(res1[0].content).toBe('SUM')

        const expr2 = '{a}.LAG(1)'
        const outer2 = toOuterText(expr2.split(''), node)
        const res2 = getBlurDisplay(outer2)
        expect(res2[1].content).toBe('.lag')

        const expr3 = 'sum'
        const outer3 = toOuterText(expr3.split(''), node)
        const res3 = getBlurDisplay(outer3)
        expect(res3[0].content).toBe('sum')
    })
    it('trace reference', (): void => {
        const book = new BookBuilder().name('book').build()
        const sheet = new SheetBuilder().name('sheet').build()
        const table = new TableBuilder().name('table').build()
        const row1 = new RowBuilder().name('row1').build()
        const row2 = new RowBuilder().name('row2').build()
        book.insertSubnode(sheet)
        sheet.insertSubnode(table)
        table.insertSubnode(row1)
        table.insertSubnode(row2)
        const textStatus = new TextStatusBuilder()
            .text('{sheet!table!row2}'.split(''))
            .build()
        // tslint:disable-next-line: no-magic-numbers
        const nodes = traceReference(textStatus.text, 2, row1)
        expect(nodes.length).toBeGreaterThan(0)
    })
})

function getBuffer(units: readonly EditorDisplayUnit[]): string {
    return units
        .map((
            u: EditorDisplayUnit,
        ): string => u.buffer === '' ? u.content : u.buffer)
        .join('')
}

function getContent(units: readonly EditorDisplayUnit[]): string {
    return units.map((u: EditorDisplayUnit): string => u.content).join('')
}
