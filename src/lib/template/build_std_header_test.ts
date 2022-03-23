import {
    Frequency,
    HeaderInfoBuilder,
    ReportDateBuilder,
} from './standard_header'
import {
    assertIsColumn,
    assertIsColumnBlock,
    isColumnBlock,
} from '@logi/src/lib/hierarchy/core'

import {buildStdHeader} from './build_std_header'

// tslint:disable-next-line: max-func-body-length
describe('test build dcf header', (): void => {
    it('full year', (): void => {
        // tslint:disable: no-magic-numbers
        const date = new ReportDateBuilder().year(2018).month(1).day(1).build()
        const info = new HeaderInfoBuilder()
            .startYear(2017)
            .endYear(2018)
            .frequency(Frequency.YEAR)
            .build()
        const header = buildStdHeader(date, [info])
        const cols = header.tree
        expect(cols.length).toBe(2)
        expect(cols[0].name).toBe('2017')
        expect(cols[0].labels).toEqual(['历史期', '当期'])
        expect(cols[1].name).toBe('2018E')
        expect(cols[1].labels).toEqual(['预测期', '预测期开始', '预测期结束'])
    })
    it('half year', (): void => {
        const date = new ReportDateBuilder().year(2018).month(8).day(1).build()
        const info = new HeaderInfoBuilder()
            .startYear(2017)
            .startMonth('H1')
            .endYear(2018)
            .endMonth('H2')
            .frequency(Frequency.HALF_YEAR)
            .build()
        const header = buildStdHeader(date, [info])
        const cols = header.tree
        expect(cols.length).toBe(4)
        expect(cols[0].name).toBe('2017H1')
        expect(cols[0].labels).toEqual(['历史期'])
        expect(cols[1].name).toBe('2017H2')
        expect(cols[1].labels).toEqual(['历史期'])
        expect(cols[2].name).toBe('2018H1')
        expect(cols[2].labels).toEqual(['历史期', '当期_半年度'])
        expect(cols[3].name).toBe('2018H2E')
        expect(cols[3].labels).toEqual(['预测期', '预测期开始_半年度', '预测期结束_半年度'])
    })
    it('quarter', (): void => {
        const date = new ReportDateBuilder().year(2018).month(8).day(1).build()
        const info = new HeaderInfoBuilder()
            .startYear(2017)
            .startMonth('Q1')
            .endYear(2018)
            .endMonth('Q3')
            .frequency(Frequency.QUARTER)
            .build()
        const header = buildStdHeader(date, [info])
        const cols = header.tree
        expect(cols.length).toBe(7)
        expect(cols[0].name).toBe('2017Q1')
        expect(cols[0].labels).toEqual(['历史期'])
        expect(cols[1].name).toBe('2017Q2')
        expect(cols[1].labels).toEqual(['历史期'])
        expect(cols[2].name).toBe('2017Q3')
        expect(cols[2].labels).toEqual(['历史期'])
        expect(cols[3].name).toBe('2017Q4')
        expect(cols[3].labels).toEqual(['历史期'])
        expect(cols[4].name).toBe('2018Q1')
        expect(cols[4].labels).toEqual(['历史期'])
        expect(cols[5].name).toBe('2018Q2')
        expect(cols[5].labels).toEqual(['历史期', '当期_季度'])
        expect(cols[6].name).toBe('2018Q3E')
        expect(cols[6].labels).toEqual(['预测期', '预测期开始_季度', '预测期结束_季度'])
    })
    it('mix full year and quarter', (): void => {
        const date = new ReportDateBuilder().year(2018).month(8).day(1).build()
        const quarterInfo = new HeaderInfoBuilder()
            .startYear(2017)
            .startMonth('Q2')
            .endYear(2018)
            .endMonth('Q4')
            .frequency(Frequency.QUARTER)
            .build()
        const fyInfo = new HeaderInfoBuilder()
            .startYear(2017)
            .endYear(2018)
            .frequency(Frequency.YEAR)
            .build()
        const header = buildStdHeader(date, [fyInfo, quarterInfo])
        const cols = header.tree
        expect(cols.length).toBe(3)
        expect(cols[0].name).toBe('季度')
        expect(cols[1].name).toBe('')
        expect(cols[2].name).toBe('年度')
        expect(isColumnBlock(cols[0])).toBe(true)
        expect(isColumnBlock(cols[2])).toBe(true)
        if (!isColumnBlock(cols[0]) || !isColumnBlock(cols[2]))
            return
        expect(cols[0].tree.length).toBe(7)
        expect(cols[2].tree.length).toBe(2)
        const fy2017 = cols[2].tree[0]
        const fy2018 = cols[2].tree[1]
        assertIsColumn(fy2017)
        assertIsColumn(fy2018)
        expect(fy2017.sliceExprs.length).toBe(0)
        expect(fy2018.sliceExprs[0].name).toBe('流量')
        expect(fy2018.sliceExprs[1].name).toBe('存量')
        expect(fy2018.sliceExprs[0].expression)
            .toBe('SUM({季度!2018Q1}, {季度!2018Q2}, {季度!2018Q3E}, {季度!2018Q4E})')
        expect(fy2018.sliceExprs[1].expression).toBe('{季度!2018Q4E}')
    })
    it('month', (): void => {
        // tslint:disable: no-magic-numbers
        const date = new ReportDateBuilder().year(2018).month(5).day(31).build()
        const info = new HeaderInfoBuilder()
            .startYear(2018)
            .endYear(2018)
            .startMonth('M2')
            .endMonth('M11')
            .frequency(Frequency.MONTH)
            .build()
        const header = buildStdHeader(date, [info])
        const cols = header.tree
        expect(cols.length).toBe(10)
        expect(cols[0].name).toBe('2018M2')
        expect(cols[0].labels).toEqual(['历史期'])
        expect(cols[3].name).toBe('2018M5')
        expect(cols[3].labels).toEqual(['历史期', '当期_月度'])
        expect(cols[4].name).toBe('2018M6E')
        expect(cols[4].labels).toEqual(['预测期', '预测期开始_月度'])
        expect(cols[9].name).toBe('2018M11E')
        expect(cols[9].labels).toEqual(['预测期', '预测期结束_月度'])
    })
    it('mix month and half year', (): void => {
        const date = new ReportDateBuilder().year(2018).month(8).day(1).build()
        const monthInfo = new HeaderInfoBuilder()
            .startYear(2017)
            .startMonth('M8')
            .endYear(2018)
            .endMonth('M12')
            .frequency(Frequency.MONTH)
            .build()
        const hyInfo = new HeaderInfoBuilder()
            .startYear(2017)
            .startMonth('H1')
            .endYear(2018)
            .endMonth('H2')
            .frequency(Frequency.HALF_YEAR)
            .build()
        const header = buildStdHeader(date, [hyInfo, monthInfo])
        const monCb = header.tree[0]
        const hyCb = header.tree[2]
        assertIsColumnBlock(hyCb)
        assertIsColumnBlock(monCb)
        expect(hyCb.name).toBe('半年度')
        expect(monCb.name).toBe('月度')
        expect(hyCb.tree.length).toBe(4)
        expect(monCb.tree.length).toBe(17)
        const hy2017h1 = hyCb.tree[0]
        const hy2017h2 = hyCb.tree[1]
        const hy2018h1 = hyCb.tree[2]
        const hy2018h2 = hyCb.tree[3]
        assertIsColumn(hy2017h1)
        assertIsColumn(hy2017h2)
        assertIsColumn(hy2018h1)
        assertIsColumn(hy2018h2)
        expect(hy2017h1.sliceExprs.length).toBe(0)
        expect(hy2017h2.sliceExprs.length).toBe(0)
        expect(hy2018h1.sliceExprs[0].name).toBe('流量')
        expect(hy2018h1.sliceExprs[0].expression)
            // tslint:disable-next-line: split-parameters-of-func-sign
            .toBe('SUM({月度!2018M1}, {月度!2018M2}, {月度!2018M3}, {月度!2018M4}, {月度!2018M5}, {月度!2018M6})')
        expect(hy2018h1.sliceExprs[1].name).toBe('存量')
        expect(hy2018h1.sliceExprs[1].expression).toBe('{月度!2018M6}')

        expect(hy2018h2.sliceExprs[0].name).toBe('流量')
        expect(hy2018h2.sliceExprs[0].expression)
            // tslint:disable-next-line: split-parameters-of-func-sign
            .toBe('SUM({月度!2018M7}, {月度!2018M8E}, {月度!2018M9E}, {月度!2018M10E}, {月度!2018M11E}, {月度!2018M12E})')
        expect(hy2018h2.sliceExprs[1].name).toBe('存量')
        expect(hy2018h2.sliceExprs[1].expression).toBe('{月度!2018M12E}')
    })
})
