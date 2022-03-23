import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
export interface FrequencyItem {
    readonly year: number
    /**
     * HY1,HY2 or Q1,Q2,Q3,Q4
     */
    readonly month: string
    /**
     * Empty item, see pug `mouseenter` function for more information.
     */
    equals(item?: FrequencyItem): boolean
    greaterThan(item: FrequencyItem): boolean
    lessThan(item: FrequencyItem): boolean
}

class FrequencyItemImpl implements Impl<FrequencyItem> {
    public year!: number
    public month!: string
    public equals(item?: FrequencyItem): boolean {
        if (item === undefined)
            return false
        return item.year === this.year && item.month === this.month
    }

    public greaterThan(item: FrequencyItem): boolean {
        const currMonth = getMonth(this.month)
        const itemMonth = getMonth(item.month)
        if (itemMonth === undefined || currMonth === undefined)
            return false
        if (this.year !== item.year)
            return this.year > item.year
        return currMonth > itemMonth
    }

    public lessThan(item: FrequencyItem): boolean {
        const currMonth = getMonth(this.month)
        const itemMonth = getMonth(item.month)
        if (itemMonth === undefined || currMonth === undefined)
            return false
        if (this.year !== item.year)
            return this.year < item.year
        return currMonth < itemMonth
    }
}

export class FrequencyItemBuilder extends
Builder<FrequencyItem, FrequencyItemImpl> {
    public constructor(obj?: Readonly<FrequencyItem>) {
        const impl = new FrequencyItemImpl()
        if (obj)
            FrequencyItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public year(year: number): this {
        this.getImpl().year = year
        return this
    }

    public month(month: string): this {
        this.getImpl().month = month
        return this
    }

    protected get daa(): readonly string[] {
        return FrequencyItemBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'year',
    ]
}

export function isFrequencyItem(value: unknown): value is FrequencyItem {
    return value instanceof FrequencyItemImpl
}

export function assertIsFrequencyItem(
    value: unknown,
): asserts value is FrequencyItem {
    if (!(value instanceof FrequencyItemImpl))
        throw Error('Not a FrequencyItem!')
}

function getMonth(item: string): number | undefined {
    const chars = item.split(/(\d+)/)
    const month = Number(chars[1])
    if (isNaN(month))
        return
    return month
}
