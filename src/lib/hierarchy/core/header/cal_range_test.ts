// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'

import {fromTimeseries} from './cal_range'

describe('date time test', (): void => {
    const data: readonly DatetimeTestData[] = [
        [['2017'], false, [2017, 1, 1], [2017, 12, 1]],
        [['FY', '2017'], false, [2017, 1, 1], [2017, 12, 1]],
        [['2017年'], false, [2017, 1, 1], [2017, 12, 1]],
        [['2017', 'Q1'], false, [2017, 1, 1], [2017, 3, 1]],
        [['2017', 'Q2'], false, [2017, 4, 1], [2017, 6, 1]],
        [['2017', 'Q3'], false, [2017, 7, 1], [2017, 9, 1]],
        [['2017', 'Q4'], false, [2017, 10, 1], [2017, 12, 1]],
        [['2017E'], false, [2017, 1, 1], [2017, 12, 1]],
        [['17', 'H1'], false, [2017, 1, 1], [2017, 6, 1]],
        [['99eh2e'], false, [1999, 7, 1], [1999, 12, 1]],
        [['2017FY'], false, [2017, 1, 1], [2017, 12, 1]],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: DatetimeTestData): void => {
        it(d.join(''), (): void => {
            const result = fromTimeseries(d[0])
            expect(isException(result)).toBe(d[1])
            if (isException(result))
                return
            expect(result.start.year).toBe(d[2][0])
            expect(result.start.month).toBe(d[2][1])
            expect(result.start.day).toBe(d[2][2])
            expect(result.end.year).toBe(d[3][0])
            expect(result.end.month).toBe(d[3][1])
            expect(result.end.day).toBe(d[3][2])
        })
    })
})

type DatetimeTestData = readonly [
    // time series
    readonly string[],
    // exception
    boolean,
    // start [year, month, day]
    readonly [number, number, number],
    // end [year, month, day]
    readonly [number, number, number],
]
