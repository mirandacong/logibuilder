// tslint:disable:ordered-imports
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'
// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
// tslint:disable-next-line: no-wildcard-import
import {importBook, exportBook} from '@logi/base/ts/spreadjs/spreadjs_sync_io'

import {CoverDataBuilder, getCoverSheet, getIdentifiedCell} from './cover'

describe('cover test', (): void => {
    it('', (): void => {
        const data = new CoverDataBuilder()
            .projId('projId')
            .modelId('modelId')
            .projName('牧原股份')
            .corpName('牧原食品股份有限公司')
            .stockCode('002714')
            .industry('畜牧业')
            .modelName('Pj_Muyuan_Foods_Model_Scenario_Huang')
            .lastModified('2020-07-22 23:34')
            .editor('黄鹏')
            .custom('Aristottle')
            .build()
        const uuid = 'uuid'
        const sheet = getCoverSheet(data, uuid)
        const cell = getIdentifiedCell(sheet)
        expect(cell.value()).toBe(uuid)
    })
    it('download', () => {
        const data = new CoverDataBuilder()
            .projId('projId')
            .modelId('modelId')
            .projName('牧原股份')
            .corpName('牧原食品股份有限公司')
            .stockCode('002714')
            .industry('畜牧业')
            .modelName('Pj_Muyuan_Foods_Model_Scenario_Huang')
            .lastModified('2020-07-22 23:34')
            .editor('黄鹏')
            .custom('Aristottle')
            .build()
        const uuid = 'uuid'
        const sheet = getCoverSheet(data, uuid)
        const b = new GC.Spread.Sheets.Workbook(undefined, {sheetCount: 0})
        b.addSheet(0, sheet)
        const path = `${__dirname}/cover1.xlsx`
        exportBook(b, path)
        const originBook = importBook(path)
        const originSheet = originBook.sheets[0]
        const book = importBook(`${__dirname}/cover.xlsx`)
        const expectedSheet = book.sheets[0]
        expect(JSON.stringify(originSheet.toJSON()))
            .toBe(JSON.stringify(expectedSheet.toJSON()))
    })
})
