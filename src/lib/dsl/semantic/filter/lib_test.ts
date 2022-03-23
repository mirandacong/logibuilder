import {isException} from '@logi/base/ts/common/exception'
import {buildTestModel4} from '@logi/src/lib/dsl/logi_test_data'
import {RowBuilder, Table} from '@logi/src/lib/hierarchy/core'

import {applyColumnFilter, matchFilter} from './lib'
import {buildFilter} from './parse'

// tslint:disable-next-line: max-func-body-length
describe('apply slicer test', (): void => {
    it('logic op', (): void => {
        const fb1 = new RowBuilder()
            .name('name')
            .labels(['hist', 'qr', 'abc', 'def'])
            .build()
        const expr1 = 'hist and abc'
        const filter1 = buildFilter(expr1)
        expect(isException(filter1)).toBe(false)
        if (isException(filter1))
            return
        const result = matchFilter(fb1, filter1)
        expect(result).toBe(true)
        const expr2 = 'not def'
        const filter2 = buildFilter(expr2)
        expect(isException(filter2)).toBe(false)
        if (isException(filter2))
            return
        const result2 = matchFilter(fb1, filter2)
        expect(result2).toBe(false)
        const expr3 = 'def or notexisted'
        const filter3 = buildFilter(expr3)
        expect(isException(filter3)).toBe(false)
        if (isException(filter3))
            return
        const result3 = matchFilter(fb1, filter3)
        expect(result3).toBe(true)
    })
    it('bracket', (): void => {
        const fb1 = new RowBuilder()
            .name('name')
            .labels(['hist', 'qr', 'abc', 'def'])
            .build()
        const expr = '(hist OR notexisted) AND qr'
        const filter = buildFilter(expr)
        expect(isException(filter)).toBe(false)
        if (isException(filter))
            return
        const result = matchFilter(fb1, filter)
        expect(result).toBe(true)
    })
    it('name', (): void => {
        const fb1 = new RowBuilder()
            .name('name')
            .labels(['hist', 'qr', 'abc', 'def'])
            .build()
        const expr = 'name'
        const filter = buildFilter(expr)
        expect(isException(filter)).toBe(false)
        if (isException(filter))
            return
        const result = matchFilter(fb1, filter)
        expect(result).toBe(true)
    })
})

// tslint:disable: no-magic-numbers
// tslint:disable-next-line: max-func-body-length
describe('match columns test', (): void => {
    it('logi4 test, only tags', (): void => {
        const book = buildTestModel4().book
        // tslint:disable-next-line: no-type-assertion
        const table = book.sheets[0].tree[4] as Table
        const cols = table.getLeafCols()

        const result1 = applyColumnFilter(cols, '2017')
        expect(isException(result1)).toBe(false)
        if (isException(result1))
            return
        expect(result1).toEqual([cols[0], cols[1], cols[2], cols[3], cols[4]])
        const result2 = applyColumnFilter(cols, '2018')
        expect(isException(result2)).toBe(false)
        if (isException(result2))
            return
        expect(result2).toEqual([cols[5], cols[6], cols[7], cols[8], cols[9]])
        const result3 = applyColumnFilter(cols, 'Q1')
        expect(isException(result3)).toBe(false)
        if (isException(result3))
            return
        expect(result3).toEqual([cols[0], cols[5], cols[10]])
        const result4 = applyColumnFilter(cols, 'FY')
        expect(isException(result4)).toBe(false)
        if (isException(result4))
            return
        expect(result4).toEqual([cols[4], cols[9], cols[14]])
    })
    it('logi1 test, distance op', (): void => {
        const book = buildTestModel4().book
        // tslint:disable-next-line: no-type-assertion
        const table = book.sheets[0].tree[4] as Table
        const cols = table.getLeafCols()
        const col = cols[8]
        const r1 = applyColumnFilter(cols, '__dp1y__', col)
        expect(r1).toEqual([cols[3], cols[5], cols[6], cols[7]])
        const r2 = applyColumnFilter(cols, '__dl1y__', col)
        expect(r2).toEqual([cols[10], cols[11], cols[12], cols[13], cols[14]])
    })
    it('logi1 test, same time op', (): void => {
        const book = buildTestModel4().book
        // tslint:disable-next-line: no-type-assertion
        const table = book.sheets[0].tree[4] as Table
        const cols = table.getLeafCols()
        const col = cols[8]
        const r1 = applyColumnFilter(cols, '__sq__', col)
        expect(r1).toEqual([cols[3], cols[8], cols[13]])
        const r2 = applyColumnFilter(cols, '__sy__', col)
        expect(r2).toEqual([cols[5], cols[6], cols[7], cols[8], cols[9]])
        const r3 = applyColumnFilter(cols, '__sr__', cols[9])
        expect(r3).toEqual([cols[4], cols[9], cols[14]])
    })
    it('logi1 test, frequency op', (): void => {
        const book = buildTestModel4().book
        // tslint:disable-next-line: no-type-assertion
        const table = book.sheets[0].tree[4] as Table
        const cols = table.getLeafCols()
        const r1 = applyColumnFilter(cols, '__fy__', cols[0])
        expect(r1).toEqual([cols[4], cols[9], cols[14]])
        const r2 = applyColumnFilter(cols, '__fq__', cols[0])
        expect(r2).toEqual([
            cols[0], cols[1], cols[2], cols[3],
            cols[5], cols[6], cols[7], cols[8],
            cols[10], cols[11], cols[12], cols[13],
        ])
    })
})
