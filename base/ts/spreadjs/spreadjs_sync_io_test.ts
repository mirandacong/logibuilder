// tslint:disable: ordered-imports
import {exportBook, importBook} from './spreadjs_sync_io'
// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
// tslint:disable-next-line: no-wildcard-import
import * as GCExcel from '@grapecity/spread-excelio'

import {readFileSync, statSync, writeFileSync} from 'fs'

describe('export test', (): void => {
    it('export test', (): void => {
        const path = `${__dirname}/Invoice.xlsx`
        const book = new GC.Spread.Sheets.Workbook()
        exportBook(book, path)
        expect(statSync(path).isFile()).toBe(true)
    })
})

describe('import test', (): void => {
    it('import test', (): void => {
        const book = importBook(__dirname + '/data.xlsx')
        expect(book.getSheet(0).name()).toBe('Billing Invoice')
    })
})

/**
 * It is sample usage of `ExcelIO.open()` and `ExcelIO.save()` here.
 *
 * The test is a sample usage at browser, if you want use it at Node.js test,
 * you can see the `importBook` and `exportBook` above.
 *
 * We need write all code at the `open` and `save` call back function, because
 * these function do dot has a sync function and we can't use promise because
 * it use a very old async code to write it.
 * When use jasmine to test the function, we need jasmine call back function
 * (like `done`) to let jasmine run all test.
 * You can see the sample code below to understand these usage.
 */
describe('import and export test', (): void => {
    // tslint:disable-next-line:mocha-no-side-effect-code max-func-body-length
    const path = `${__dirname}/test.xlsx`
    // tslint:disable-next-line:mocha-no-side-effect-code
    const wb = new GC.Spread.Sheets.Workbook()
    // tslint:disable-next-line:mocha-no-side-effect-code
    const sheet = new GC.Spread.Sheets.Worksheet('mysheet')
    // tslint:disable-next-line:mocha-no-side-effect-code
    wb.addSheet(0, sheet)
    // tslint:disable-next-line:mocha-no-side-effect-code
    const excelIo = new GCExcel.IO()
    // tslint:disable-next-line:mocha-no-side-effect-code
    it('import and export test', (done: Function): void => {
        excelIo.save(
            JSON.stringify(wb.toJSON()),
            (saveData: string): void => {
                writeFileSync(path, Buffer.from(saveData))
                const newWb = new GC.Spread.Sheets.Workbook()
                const file = readFileSync(path)
                excelIo.open(file.buffer, (data: string): void => {
                    newWb.fromJSON(data)
                    expect(newWb.getSheet(0).name()).toBe('mysheet')
                    done()
                })
            },
            (err: Error): void => {
                // tslint:disable-next-line: no-throw-unless-asserts
                throw err
            },
            {useArrayBuffer: true},
        )
    })
})
