// tslint:disable:ordered-imports
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
// tslint:disable-next-line: no-wildcard-import
import * as GCExcel from '@grapecity/spread-excelio'

import {loopWhile} from 'deasync'
import {readFileSync, writeFileSync} from 'fs'
import {name} from 'platform'

/**
 * IMPORTANT NOTICE:
 *  * This `importBook` and `exportBook`function only can running at Node.js
 *    for the package `mock-browser` and `deasync` can not run at browser.
 *  * If you want to use this function at a `ts_library`, confirm the
 *    `ts_library` would not use at browser.
 *  * If you import these function and `GC` and `GCExcel` at the same time. You
 *    must import this function first such as the code example below for that
 *    we need to mock the browser before we import `GC` and `GCExcel` and the
 *    mock function is in this file.
 *
 *    Example:
 *    ```
 *       // tslint:disable:ordered-imports
 *       import {importBook, exportBook} from './spreadjs_sync_io'
 *       import * as GC from '@grapecity/spread-sheets'
 *       // @ts-ignore
 *       import * as GCExcel from '@grapecity/spread-excelio'
 *       ...
 *       ...
 *    ```
 */

/**
 * Import an excel into spreadjs workbook via the given path.
 * See the `IMPORTANT NOTICE` comment above before you use this function.
 */
export function importBook(
    path: string,
    cal = false,
): GC.Spread.Sheets.Workbook {
    checkNodejs()
    const wb = new GC.Spread.Sheets.Workbook()
    const excelIo = new GCExcel.IO()
    const file = readFileSync(path)
    let done = false
    excelIo.open(file.buffer, (data: string): void => {
        wb.fromJSON(data, {doNotRecalculateAfterLoad: cal})
        done = true
    })
    loopWhile((): boolean => !done)

    return wb
}

/**
 * Export the spreadjs workbook into excel via given path.
 * See the `IMPORTANT NOTICE` comment above before you use this function.
 */
export function exportBook(wb: GC.Spread.Sheets.Workbook, path: string): void {
    checkNodejs()
    const excelIo = new GCExcel.IO()
    let done = false
    excelIo.save(
        JSON.stringify(wb.toJSON()),
        (data: string): void => {
            writeFileSync(path, Buffer.from(data))
            done = true
        },
        (err: Error): void => {
            // tslint:disable-next-line: no-throw-unless-asserts
            throw err
        },
        {useArrayBuffer: true},
    )
    loopWhile((): boolean => !done)
}

function checkNodejs(): void {
    if (name === 'Node.js')
        return
    // tslint:disable-next-line: no-throw-unless-asserts
    throw Error('This function must running at Node.js for package' +
        ' "deasync" and "mock-browser" can only running at Node.js')
}
