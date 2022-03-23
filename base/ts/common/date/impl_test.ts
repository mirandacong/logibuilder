// tslint:disable: no-magic-numbers
import {add, DateBuilder, DateDeltaBuilder, eq, le, lt, sub} from './impl'

describe('date test', () => {
    it('build date test', () => {
        const date1 = new DateBuilder().year(2019).month(2).day(3).build()
        expect(date1.year).toBe(2019)
        expect(date1.month).toBe(2)
        expect(date1.day).toBe(3)
    })
    it('build dateDelta test', () => {
        const dateDelta1 = new DateDeltaBuilder()
            .year(2)
            .month(3)
            .day(4)
            .build()
        expect(dateDelta1.year).toBe(2)
        expect(dateDelta1.month).toBe(3)
        expect(dateDelta1.day).toBe(4)
        const dateDelta2 = new DateDeltaBuilder().build()
        expect(dateDelta2.year).toBe(0)
        expect(dateDelta2.month).toBe(0)
        expect(dateDelta2.day).toBe(0)
    })
})

// tslint:disable-next-line: max-func-body-length
describe('simple date calculation', (): void => {
    it('add', (): void => {
        const date = new DateBuilder().year(2018).month(1).day(1).build()
        const delta1 = new DateDeltaBuilder().year(1).build()
        const res1 = add(date, delta1)
        expect(res1.year).toBe(2019)

        const delta2 = new DateDeltaBuilder().month(11).build()
        const res2 = add(date, delta2)
        expect(res2.year).toBe(2018)
        expect(res2.month).toBe(12)

        const delta3 = new DateDeltaBuilder().month(12).build()
        const res3 = add(date, delta3)
        expect(res3.year).toBe(2019)
        expect(res3.month).toBe(1)

        const delta4 = new DateDeltaBuilder().month(24).build()
        const res4 = add(date, delta4)
        expect(res4.year).toBe(2020)
        expect(res4.month).toBe(1)

        const delta5 = new DateDeltaBuilder().month(23).build()
        const res5 = add(date, delta5)
        expect(res5.year).toBe(2019)
        expect(res5.month).toBe(12)
    })
    it('sub', (): void => {
        const date = new DateBuilder().year(2018).month(12).day(1).build()
        const delta1 = new DateDeltaBuilder().year(1).build()
        const res1 = sub(date, delta1)
        expect(res1.year).toBe(2017)

        const delta2 = new DateDeltaBuilder().month(11).build()
        const res2 = sub(date, delta2)
        expect(res2.year).toBe(2018)
        expect(res2.month).toBe(1)

        const delta3 = new DateDeltaBuilder().month(12).build()
        const res3 = sub(date, delta3)
        expect(res3.year).toBe(2017)
        expect(res3.month).toBe(12)

        const delta4 = new DateDeltaBuilder().month(24).build()
        const res4 = sub(date, delta4)
        expect(res4.year).toBe(2016)
        expect(res4.month).toBe(12)

        const delta5 = new DateDeltaBuilder().month(23).build()
        const res5 = sub(date, delta5)
        expect(res5.year).toBe(2017)
        expect(res5.month).toBe(1)
    })
    it('eq', (): void => {
        const date1 = new DateBuilder().year(2018).month(1).day(1).build()
        const date2 = new DateBuilder().year(2018).month(1).day(1).build()
        const date3 = new DateBuilder().year(2018).month(2).day(1).build()
        expect(eq(date1, date2)).toBe(true)
        expect(eq(date1, date3)).toBe(false)
    })
    it('lt', (): void => {
        const date1 = new DateBuilder().year(2018).month(1).day(1).build()
        const date2 = new DateBuilder().year(2018).month(1).day(1).build()
        const date3 = new DateBuilder().year(2017).month(1).day(1).build()
        expect(lt(date1, date2)).toBe(false)
        expect(lt(date3, date1)).toBe(true)
        expect(lt(date2, date3)).toBe(false)
    })
    it('le', (): void => {
        const date1 = new DateBuilder().year(2018).month(1).day(1).build()
        const date2 = new DateBuilder().year(2018).month(1).day(1).build()
        const date3 = new DateBuilder().year(2017).month(1).day(1).build()
        expect(le(date1, date2)).toBe(true)
        expect(le(date2, date3)).toBe(false)
    })
})
