import {Builder} from '@logi/base/ts/common/builder'
import {isException} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Column, ColumnBuilder} from '../column'
import {Table} from '../table'

import {toDateRange} from './cal_range'
import {DateRange} from './date_range'
import {UnionHeader, UnionHeaderBuilder} from './union_header'

/**
 * Merge the cols in the tables by same date range.
 * Order the combined header by year. And the header that is not a date would be
 * put at the end.
 */
// tslint:disable-next-line: max-func-body-length
export function mergeTableHeader(
    tables: readonly Readonly<Table>[],
): UnionHeader {
    const infos: WalkInfo[] = []
    tables.forEach((t: Readonly<Table>): void => {
        t.getLeafCols().forEach((c: Readonly<Column>): void => {
            const name = normalizeName(c)
            const range = toDateRange(c)
            if (isException(range)) {
                const targetName = infos.find(i => i.name === name)
                if (targetName !== undefined) {
                    targetName.cols.add(c)
                    return
                }
                infos.push(new WalkInfoBuilder()
                    .name(name)
                    .cols(new Set([c]))
                    .build())
                return
            }
            const target = infos.find((i: WalkInfo): boolean => {
                if (i.range === undefined)
                    return false
                if (i.range.start.year !== range.start.year ||
                    i.range.start.month !== range.start.month)
                    return false
                if (i.range.end.year !== range.end.year ||
                    i.range.end.month !== range.end.month)
                    return false
                return true
            })
            if (target !== undefined) {
                target.cols.add(c)
                return
            }
            const info = new WalkInfoBuilder()
                .range(range)
                .cols(new Set([c]))
                .name(name)
                .build()
            infos.push(info)
        })
    })
    const sorted = infos.sort((a: WalkInfo, b: WalkInfo): number => {
        if (a.name === '')
            return -1
        if (b.name === '')
            return 1
        if (a.range === undefined && b.range === undefined)
            return 0
        if (a.range === undefined)
            return 1
        if (b.range === undefined)
            return -1
        const deltaA = a.range.end.month - a.range.start.month
        const deltaB = b.range.end.month - b.range.start.month
        if (deltaA !== deltaB)
            return deltaB - deltaA
        if (a.range.start.year !== b.range.start.year)
            return a.range.start.year - b.range.start.year
        return a.range.start.month - b.range.start.month
    })
    const unionCols: Readonly<Column>[] = []
    const toUnionCol = new Map<string, Readonly<Column>>()
    const toRelatedCols = new Map<string, Map<string, string>>()
    sorted.forEach((info: WalkInfo): void => {
        const c = new ColumnBuilder().name(info.name).build()
        unionCols.push(c)
        const tableMap = new Map<string, string>()
        info.cols.forEach((ori: Readonly<Column>): void => {
            // tslint:disable-next-line: no-type-assertion
            const table = ori.getTable() as Readonly<Table>
            tableMap.set(table.uuid, ori.uuid)
            toUnionCol.set(ori.uuid, c)
        })
        toRelatedCols.set(c.uuid, tableMap)
    })
    return new UnionHeaderBuilder()
        .unionCols(unionCols)
        .toUnionCol(toUnionCol)
        .toRelatedCols(toRelatedCols)
        .build()
}

function normalizeName(col: Readonly<Column>): string {
    const range = toDateRange(col)
    if (isException(range))
        return col.name
    let month = ''
    const monthDelta = range.end.month - range.start.month + 1
    const monthCount = range.end.month / monthDelta
    switch (monthDelta) {
    // tslint:disable: no-magic-numbers
    case 12:
        month = ''
        break
    case 6:
        month = `H${monthCount}`
        break
    case 3:
        month = `Q${monthCount}`
        break
    case 1:
        month = `M${monthCount}`
        break
    default:
    }
    const suffixE = col.name.endsWith('E') ? 'E' : ''
    return `${range.end.year}${month}${suffixE}`
}

interface WalkInfo {
    readonly range?: DateRange
    readonly name: string
    readonly cols: Set<Readonly<Column>>
}

class WalkInfoImpl implements Impl<WalkInfo> {
    public range?: DateRange
    public name!: string
    public cols = new Set<Readonly<Column>>()
}

class WalkInfoBuilder extends Builder<WalkInfo, WalkInfoImpl> {
    public constructor(obj?: Readonly<WalkInfo>) {
        const impl = new WalkInfoImpl()
        if (obj)
            WalkInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: DateRange): this {
        this.getImpl().range = range
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public cols(cols: Set<Readonly<Column>>): this {
        this.getImpl().cols = cols
        return this
    }

    protected get daa(): readonly string[] {
        return WalkInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
    ]
}
