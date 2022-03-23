/**
 * Base on `Date` ts interface, when call `new Date('2020-06-01').getMonth()`
 * will return 5.
 * `ONE, TWO, THREE, FOUR` are each quarter.
 * For example
 *  '2020-03-01' is the `ONE` quarter.
 *  '2020-09-01' is the `THREE` quarter.
 */

export const enum Month {
    JAN = 1,
    FEB = 2,
    MAR = 3,
    APR = 4,
    MAY = 5,
    JUN = 6,
    JUL = 7,
    AUG = 8,
    SEPT = 9,
    OCT = 10,
    NOV = 11,
    DEC = 12,
}

export function getQuarter(d: string): number {
    const date = new Date(d)
    const mon = date.getMonth() + 1
    switch (mon) {
    case Month.JAN: case Month.FEB: case Month.MAR:
        return 1
    case Month.APR: case Month.MAY: case Month.JUN:
        return 2
    case Month.JUL: case Month.AUG: case Month.SEPT:
        return 3
    case Month.OCT: case Month.NOV: case Month.DEC:
        return 4
    default:
        return -1
    }
}
