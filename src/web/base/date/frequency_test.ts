import {
    getDateByDistance,
    getDistanceByDates,
    getLatestDateFromNow,
} from './frequency'

// tslint:disable: max-func-body-length chain-methods-length-limit
// tslint:disable: split-parameters-of-func-sign
describe('calcDistanceByDates test', () => {
    it('day', () => {
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-08-30'), 'day')).toBe(0)
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-08-29'), 'day')).toBe(-1)
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-09-01'), 'day')).toBe(2)
    })
    it('week', () => {
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-09-01'), 'week')).toBe(0)
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-09-17'), 'week')).toBe(2)
    })
    it('month', () => {
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-08-08'), 'month')).toBe(0)
        expect(getDistanceByDates(new Date('2021-08-30'), new Date('2021-10-16'), 'month')).toBe(2)
    })
    it('quarter', () => {
        expect(getDistanceByDates(new Date('2021-12-31'), new Date('2021-12-31'), 'quarter')).toBe(0)
        expect(getDistanceByDates(new Date('2021-09-30'), new Date('2021-12-31'), 'quarter')).toBe(1)
        expect(getDistanceByDates(new Date('2021-12-31'), new Date('2021-09-30'), 'quarter')).toBe(-1)
    })
    it('half year', () => {
        expect(getDistanceByDates(new Date('2021-06-30'), new Date('2021-12-31'), 'halfYear')).toBe(1)
        expect(getDistanceByDates(new Date('2021-12-31'), new Date('2021-12-31'), 'halfYear')).toBe(0)
        expect(getDistanceByDates(new Date('2021-12-31'), new Date('2021-06-30'), 'halfYear')).toBe(-1)
    })
    it('year', () => {
        expect(getDistanceByDates(new Date('2021-12-31'), new Date('2021-12-31'), 'year')).toBe(0)
        expect(getDistanceByDates(new Date('2022-12-31'), new Date('2021-12-31'), 'year')).toBe(-1)
        expect(getDistanceByDates(new Date('2021-12-31'), new Date('2022-12-31'), 'year')).toBe(1)
    })
})

describe('getDateByDistance test', () => {
    it('quarter', () => {
        expect(formatDate(getDateByDistance(new Date('2021-09-30'), 0, 'quarter'))).toBe('2021-06-30')
        expect(formatDate(getDateByDistance(new Date('2021-09-30'), 1, 'quarter'))).toBe('2021-09-30')
        expect(formatDate(getDateByDistance(new Date('2021-09-30'), -1, 'quarter'))).toBe('2021-03-31')
    })
    it('half year', () => {
        expect(formatDate(getDateByDistance(new Date('2021-06-30'), 0, 'halfYear'))).toBe('2020-12-31')
        expect(formatDate(getDateByDistance(new Date('2021-06-30'), 1, 'halfYear'))).toBe('2021-06-30')
        expect(formatDate(getDateByDistance(new Date('2021-06-30'), -1, 'halfYear'))).toBe('2020-06-30')
    })
    it('year', () => {
        expect(formatDate(getDateByDistance(new Date('2020-12-31'), 0, 'year'))).toBe('2019-12-31')
        expect(formatDate(getDateByDistance(new Date('2020-12-31'), 1, 'year'))).toBe('2020-12-31')
        expect(formatDate(getDateByDistance(new Date('2020-12-31'), -1, 'year'))).toBe('2018-12-31')
    })
})

describe('getLatestDateFromNow test', () => {
    it('day', () => {
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-17'), 'day'))).toBe('2021-11-16')
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-01'), 'day'))).toBe('2021-10-31')
    })
    it('week', () => {
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-17'), 'week'))).toBe('2021-11-12')
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-19'), 'week'))).toBe('2021-11-12')
    })
    it('month', () => {
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-17'), 'month'))).toBe('2021-10-31')
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-30'), 'month'))).toBe('2021-10-31')
    })
    it('quarter', () => {
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-17'), 'quarter'))).toBe('2021-09-30')
        expect(formatDate(getLatestDateFromNow(new Date('2021-09-30'), 'quarter'))).toBe('2021-06-30')
        expect(formatDate(getLatestDateFromNow(new Date('2021-03-13'), 'quarter'))).toBe('2020-12-31')
    })
    it('half year', () => {
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-17'), 'halfYear'))).toBe('2021-06-30')
        expect(formatDate(getLatestDateFromNow(new Date('2021-06-30'), 'halfYear'))).toBe('2020-12-31')
    })
    it('year', () => {
        expect(formatDate(getLatestDateFromNow(new Date('2021-11-17'), 'year'))).toBe('2020-12-31')
        expect(formatDate(getLatestDateFromNow(new Date('2021-12-31'), 'year'))).toBe('2020-12-31')
    })
})

function formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${date.getFullYear()}-${month}-${d}`
}
