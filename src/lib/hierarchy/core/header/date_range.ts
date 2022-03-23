import {Builder} from '@logi/base/ts/common/builder'
import {Datetime} from '@logi/base/ts/common/datetime'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface DateRange {
    readonly start: Datetime
    readonly end: Datetime
}

class DateRangeImpl implements Impl<DateRange> {
    public start!: Datetime
    public end!: Datetime
}

export class DateRangeBuilder extends Builder<DateRange, DateRangeImpl> {
    public constructor(obj?: Readonly<DateRange>) {
        const impl = new DateRangeImpl()
        if (obj)
            DateRangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public start(start: Datetime): this {
        this.getImpl().start = start
        return this
    }

    public end(end: Datetime): this {
        this.getImpl().end = end
        return this
    }

    protected get daa(): readonly string[] {
        return DateRangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'start',
        'end',
    ]
}
