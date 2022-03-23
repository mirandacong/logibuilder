// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'
import {readFileSync} from 'fs'

import {openExcel} from './lib'

describe('lib test', (): void => {
    it('remove external formula in spreadjs', async(): Promise<void> => {
        const buf = readFileSync(`${__dirname}/test.xlsx`)
        const excel = await openExcel(buf.buffer).toPromise()
        const names = excel.getCustomNames()
        expect(names.length).toBe(1)
        expect(names[0].getName()).toBe('normal')
        const sheet = excel.sheets[0]
        const cell1 = sheet.getCell(0, 0)
        expect(cell1.formula()).toBeNull()
        expect(cell1.value()).toBe(1)
        const cell2 = sheet.getCell(1, 0)
        expect(cell2.formula()).toBeNull()
        // tslint:disable: no-magic-numbers
        expect(cell2.value()).toBe(2)
        const sheetNames = sheet.getCustomNames()
        expect(sheetNames.length).toBe(0)
    })
})
