import {formatDate, DateFormatConfig} from './impl'

// tslint:disable: no-magic-numbers
describe('date test', (): void => {
    it('format date', (): void => {
        expect(formatDate(new Date(2012, 1, 1))).toBe('2012-02-01')
        expect(formatDate(new Date(2012, 8, 9))).toBe('2012-09-09')
        expect(formatDate(new Date(2012, 9, 10))).toBe('2012-10-10')
        const config: DateFormatConfig = {
            separator: '/',
            zeroFill: false,
        }
        expect(formatDate(new Date(2012, 1, 1), config)).toBe('2012/2/1')
    })
})
