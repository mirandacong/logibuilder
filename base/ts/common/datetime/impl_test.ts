// tslint:disable: no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'

import {
    DatetimeBuilder,
    DatetimeDelta,
    DatetimeDeltaBuilder,
    toTimeDelta,
} from './impl'

// tslint:disable-next-line: max-func-body-length
describe('date test', (): void => {
    it('build date test', (): void => {
        const date1 = new DatetimeBuilder()
            .year(1)
            .month(2)
            .day(3)
            .hour(4)
            .minute(5)
            .second(6)
            .millisecond(7)
            .microsecond(8)
            .build()
        expect(date1.year).toBe(1)
        expect(date1.month).toBe(2)
        expect(date1.day).toBe(3)
        expect(date1.hour).toBe(4)
        expect(date1.minute).toBe(5)
        expect(date1.second).toBe(6)
        expect(date1.millisecond).toBe(7)
        expect(date1.microsecond).toBe(8)
    })
    it('build dateDelta test', (): void => {
        const date1 = new DatetimeDeltaBuilder()
            .year(1)
            .month(2)
            .day(3)
            .hour(4)
            .minute(5)
            .second(6)
            .millisecond(7)
            .microsecond(8)
            .build()
        expect(date1.year).toBe(1)
        expect(date1.month).toBe(2)
        expect(date1.day).toBe(3)
        expect(date1.hour).toBe(4)
        expect(date1.minute).toBe(5)
        expect(date1.second).toBe(6)
        expect(date1.millisecond).toBe(7)
        expect(date1.microsecond).toBe(8)
        const dateDelta2 = new DatetimeDeltaBuilder().build()
        expect(dateDelta2.year).toBe(0)
        expect(dateDelta2.month).toBe(0)
        expect(dateDelta2.day).toBe(0)
        expect(dateDelta2.hour).toBe(0)
        expect(dateDelta2.minute).toBe(0)
        expect(dateDelta2.second).toBe(0)
        expect(dateDelta2.millisecond).toBe(0)
        expect(dateDelta2.microsecond).toBe(0)
    })
    it('dateDelta from/to string test', (): void => {
        const date1 = new DatetimeDeltaBuilder()
            .year(1)
            .month(2)
            .day(3)
            .hour(4)
            .minute(5)
            .second(6)
            .millisecond(7)
            .build()
        expect(date1.toIsoString()).toBe('P1Y2M3DT4H5M6.007S')
        const date2 = new DatetimeDeltaBuilder()
            .fromIsoString(date1.toIsoString())
            .build()
        expect(date2).toEqual(date1)
    })
})

type TimeDeltaTestData = readonly [
    // year
    number,
    // month
    number,
    // day
    number
]

type ConvertTestData = readonly [
    // input string
    string,
    // is exception
    boolean,
    // timedelta
    TimeDeltaTestData | undefined,
]

describe('toTimeDelta test', (): void => {
    const data: ConvertTestData[] = [
        ['1y', false, [1, 0, 0]],
        ['2Y', false, [2, 0, 0]],
        ['1hy', false, [0, 6, 0]],
        ['1q', false, [0, 3, 0]],
        ['2Q', false, [0, 6, 0]],
        ['1m', false, [0, 1, 0]],
        ['3m', false, [0, 3, 0]],
        ['1d', false, [0, 0, 1]],
        ['Y', true, undefined],
        ['other', true, undefined],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: ConvertTestData): void => {
        it(d[0], (): void => {
            const result = toTimeDelta(d[0])
            expect(isException(result)).toBe(d[1])
            // tslint:disable-next-line: early-exit
            if (!d[1]) {
                // tslint:disable-next-line: no-type-assertion
                const timeDelta = result as DatetimeDelta
                // tslint:disable-next-line: no-type-assertion
                const expectTimeDelta = toDelta(d[2] as TimeDeltaTestData)
                expect(timeDelta.year).toBe(expectTimeDelta.year)
                expect(timeDelta.month).toBe(expectTimeDelta.month)
                expect(timeDelta.day).toBe(expectTimeDelta.day)
            }
        })
    })
})

function toDelta(data: TimeDeltaTestData): DatetimeDelta {
    return new DatetimeDeltaBuilder()
        .year(data[0])
        .month(data[1])
        .day(data[2])
        .build()
}
