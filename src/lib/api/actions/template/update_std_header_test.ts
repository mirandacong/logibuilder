import {
    buildDcfHeader,
    EditorServiceBuilder,
    handleAction,
} from '@logi/src/lib/api'
import {
    assertIsColumnBlock,
    assertIsTable,
    BookBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    ItemBuilder ,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'
import {
    Frequency,
    HeaderInfoBuilder,
    ReportDateBuilder,
    StandardHeaderBuilder,
    TemplateSetBuilder,
    UnitEnum,
} from '@logi/src/lib/template'

import {ActionBuilder} from './update_std_header'

// tslint:disable-next-line: max-func-body-length
describe('test set standard header action', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('update single header to single header', (): void => {
        const oldInfo = new HeaderInfoBuilder()
            // tslint:disable: no-magic-numbers
            .startYear(2017)
            .frequency(Frequency.YEAR)
            .endYear(2019)
            .build()
        const oldDate = new ReportDateBuilder()
            .year(2018)
            .month(12)
            .day(1)
            .build()
        const header = buildDcfHeader(oldDate, [oldInfo])
        const oldCols = header.tree.slice()
        const table = new TableBuilder()
            .name('')
            .referenceHeader('std')
            .subnodes(oldCols)
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(oldDate)
            .headerInfos([oldInfo])
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .build()
        const service = new EditorServiceBuilder()
            .templateSet(set)
            .book(book)
            .build()
        const info = new HeaderInfoBuilder()
            // tslint:disable: no-magic-numbers
            .startYear(2018)
            .frequency(Frequency.YEAR)
            .endYear(2020)
            .build()
        const date = new ReportDateBuilder().year(2019).month(11).day(1).build()
        const newHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(date)
            .headerInfos([info])
            .build()
        const action = new ActionBuilder().stdHeader(newHeader).build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols.length).toBe(3)
        expect(newTable.cols[0].uuid).toBe(oldCols[1].uuid)
        expect(newTable.cols[0].name).toBe('2018')
        expect(newTable.cols[0].labels).toEqual(['历史期', '当期'])
        expect(newTable.cols[1].uuid).toBe(oldCols[2].uuid)
        expect(newTable.cols[1].name).toBe('2019E')
        expect(newTable.cols[1].labels).toEqual(['预测期', '预测期开始'])
        expect(newTable.cols[2].name).toBe('2020E')
        expect(newTable.cols[2].labels).toEqual(['预测期', '预测期结束'])
    })
    // tslint:disable-next-line: max-func-body-length
    it('update multi header to multi header', (): void => {
        // tslint:disable: no-magic-numbers
        const oldInfos = [
            new HeaderInfoBuilder()
                .startYear(2017)
                .frequency(Frequency.YEAR)
                .endYear(2019)
                .build(),
            new HeaderInfoBuilder()
                .startYear(2017)
                .startMonth('Q1')
                .frequency(Frequency.QUARTER)
                .endYear(2019)
                .endMonth('Q4')
                .build(),
        ]
        const oldDate = new ReportDateBuilder()
            .year(2018)
            .month(8)
            .day(1)
            .build()
        const header = buildDcfHeader(oldDate, oldInfos)
        const oldCols = header.tree.slice()
        const table = new TableBuilder()
            .name('')
            .referenceHeader('std')
            .subnodes(oldCols)
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(oldDate)
            .headerInfos(oldInfos)
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .build()
        const service = new EditorServiceBuilder()
            .templateSet(set)
            .book(book)
            .build()
        const infos = [
            new HeaderInfoBuilder()
                .startYear(2018)
                .startMonth('Q1')
                .frequency(Frequency.QUARTER)
                .endMonth('Q4')
                .endYear(2020)
                .build(),
            new HeaderInfoBuilder()
                .startYear(2018)
                .startMonth('H1')
                .frequency(Frequency.HALF_YEAR)
                .endYear(2020)
                .endMonth('H2')
                .build(),
        ]
        const date = new ReportDateBuilder().year(2019).month(11).day(1).build()
        const newHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(date)
            .headerInfos(infos)
            .build()
        const action = new ActionBuilder().stdHeader(newHeader).build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols.length).toBe(3)
        const qr = newTable.cols[0]
        const oldQr = table.cols[0]
        assertIsColumnBlock(qr)
        assertIsColumnBlock(oldQr)
        expect(qr.name).toBe('季度')
        expect(qr.uuid).toBe(oldQr.uuid)
        expect(qr.tree.length).toBe(12)
        expect(qr.tree[0].name).toBe('2018Q1')
        expect(qr.tree[0].labels).toEqual(['历史期'])
        expect(qr.tree[0].uuid).toBe(oldQr.tree[4].uuid)
        expect(qr.tree[6].name).toBe('2019Q3')
        expect(qr.tree[6].labels).toEqual(['历史期', '当期_季度'])
        expect(qr.tree[6].uuid).toBe(oldQr.tree[10].uuid)
        expect(qr.tree[7].name).toBe('2019Q4E')
        expect(qr.tree[7].labels).toEqual(['预测期', '预测期开始_季度'])
        expect(qr.tree[7].uuid).toBe(oldQr.tree[11].uuid)
        expect(qr.tree[11].name).toBe('2020Q4E')
        expect(qr.tree[11].labels).toEqual(['预测期', '预测期结束_季度'])

        expect(newTable.cols[1].name).toBe('')

        const hy = newTable.cols[2]
        assertIsColumnBlock(hy)
        expect(hy.name).toBe('半年度')
        expect(hy.tree.length).toBe(6)
    })
    // tslint:disable-next-line: max-func-body-length
    it('update multi header to single header', (): void => {
        // tslint:disable: no-magic-numbers
        const oldInfos = [
            new HeaderInfoBuilder()
                .startYear(2017)
                .frequency(Frequency.YEAR)
                .endYear(2019)
                .build(),
            new HeaderInfoBuilder()
                .startYear(2017)
                .startMonth('Q1')
                .frequency(Frequency.QUARTER)
                .endYear(2019)
                .endMonth('Q4')
                .build(),
        ]
        const oldDate = new ReportDateBuilder()
            .year(2018)
            .month(8)
            .day(1)
            .build()
        const header = buildDcfHeader(oldDate, oldInfos)
        const oldCols = header.tree.slice()
        const table = new TableBuilder()
            .name('')
            .referenceHeader('std')
            .subnodes(oldCols)
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(oldDate)
            .headerInfos(oldInfos)
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .build()
        const service = new EditorServiceBuilder()
            .templateSet(set)
            .book(book)
            .build()
        const infos = [
            new HeaderInfoBuilder()
                .startYear(2018)
                .frequency(Frequency.YEAR)
                .endYear(2020)
                .build(),
        ]
        const date = new ReportDateBuilder().year(2019).month(11).day(1).build()
        const newHeader = new StandardHeaderBuilder()
            .reportDate(date)
            .headerInfos(infos)
            .name('std')
            .build()
        const action = new ActionBuilder().stdHeader(newHeader).build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols.length).toBe(3)
        const old = table.cols[2]
        assertIsColumnBlock(old)
        expect(newTable.cols.length).toBe(3)
        expect(newTable.cols[0].uuid).toBe(old.tree[1].uuid)
        expect(newTable.cols[0].name).toBe('2018')
        expect(newTable.cols[0].labels).toEqual(['历史期', '当期'])
        expect(newTable.cols[1].uuid).toBe(old.tree[2].uuid)
        expect(newTable.cols[1].name).toBe('2019E')
        expect(newTable.cols[1].labels).toEqual(['预测期', '预测期开始'])
        expect(newTable.cols[2].name).toBe('2020E')
    })
    // tslint:disable-next-line: max-func-body-length
    it('update single header to multi header', (): void => {
        // tslint:disable: no-magic-numbers
        const oldInfos = [
            new HeaderInfoBuilder()
                .startYear(2017)
                .frequency(Frequency.YEAR)
                .endYear(2019)
                .build(),
        ]
        const oldDate = new ReportDateBuilder()
            .year(2018)
            .month(8)
            .day(1)
            .build()
        const header = buildDcfHeader(oldDate, oldInfos)
        const oldCols = header.tree.slice()
        const table = new TableBuilder()
            .name('')
            .referenceHeader('std')
            .subnodes(oldCols)
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(oldDate)
            .headerInfos(oldInfos)
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .build()
        const service = new EditorServiceBuilder()
            .templateSet(set)
            .book(book)
            .build()
        const infos = [
            new HeaderInfoBuilder()
                .startYear(2018)
                .startMonth('Q1')
                .frequency(Frequency.QUARTER)
                .endYear(2020)
                .endMonth('Q4')
                .build(),
            new HeaderInfoBuilder()
                .startYear(2018)
                .frequency(Frequency.YEAR)
                .endYear(2020)
                .build(),
        ]
        const date = new ReportDateBuilder().year(2020).month(11).day(1).build()
        const newHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(date)
            .headerInfos(infos)
            .build()
        const action = new ActionBuilder().stdHeader(newHeader).build()
        handleAction(action, service)
        const newTable = service.book.sheets[0].tree[0]
        assertIsTable(newTable)
        expect(newTable.cols.length).toBe(3)
        const qr = newTable.cols[0]
        assertIsColumnBlock(qr)
        expect(qr.name).toBe('季度')
        expect(qr.tree.length).toBe(12)

        expect(newTable.cols[1].name).toBe('')

        const hy = newTable.cols[2]
        assertIsColumnBlock(hy)
        expect(hy.tree.length).toBe(3)
        expect(hy.tree[0].name).toBe('2018')
        expect(hy.tree[0].uuid).toBe(table.cols[1].uuid)
        expect(hy.tree[0].labels).toEqual(['历史期'])
        expect(hy.tree[1].name).toBe('2019')
        expect(hy.tree[1].uuid).toBe(table.cols[2].uuid)
        expect(hy.tree[1].labels).toEqual(['历史期', '当期'])
        expect(hy.tree[2].name).toBe('2020E')
        expect(hy.tree[2].labels).toEqual(['预测期', '预测期开始', '预测期结束'])
    })
    // tslint:disable-next-line: max-func-body-length
    it('update single header to single header', (): void => {
        const oldInfo = new HeaderInfoBuilder()
            // tslint:disable: no-magic-numbers
            .startYear(2017)
            .frequency(Frequency.YEAR)
            .endYear(2019)
            .build()
        const oldDate = new ReportDateBuilder()
            .year(2018)
            .month(12)
            .day(1)
            .build()
        const header = buildDcfHeader(oldDate, [oldInfo])
        const oldCols = header.tree.slice()
        const row = new RowBuilder().name('').build()
        const table = new TableBuilder()
            .name('')
            .referenceHeader('std')
            .subnodes([row, ...oldCols])
            .build()
        const sheet = new SheetBuilder().name('').tree([table]).build()
        const book = new BookBuilder().name('').sheets([sheet]).build()
        const stdHeader = new StandardHeaderBuilder()
            .name('std')
            .reportDate(oldDate)
            .headerInfos([oldInfo])
            .unit(UnitEnum.TEN_THOUSAND)
            .build()
        const set = new TemplateSetBuilder()
            .standardHeaders([stdHeader])
            .build()
        const item = new ItemBuilder()
            .row(row.uuid)
            .col(oldCols[0].uuid)
            .source(new ManualSourceBuilder().value(100).build())
            .build()
        const sm = new SourceManager([item])
        const service = new EditorServiceBuilder()
            .templateSet(set)
            .book(book)
            .sourceManager(sm)
            .build()
        const newHeader = new StandardHeaderBuilder(stdHeader)
            .unit(UnitEnum.MILLION)
            .build()
        const action = new ActionBuilder().stdHeader(newHeader).build()
        handleAction(action, service)
        const newS = service.sourceManager.getSource(row.uuid, oldCols[0].uuid)
        expect(newS?.value).toEqual(1)
    })
})
