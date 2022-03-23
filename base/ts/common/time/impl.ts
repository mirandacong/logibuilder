import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Time {
    readonly hour: number
    readonly minute: number
    readonly second: number
    readonly millisecond: number
    readonly microsecond: number
}

// tslint:disable-next-line: no-empty-interface
export interface TimeDelta extends Time {}

class TimeImpl implements Time {
    public hour = 0
    public minute = 0
    public second = 0
    public millisecond = 0
    public microsecond = 0
}

export abstract class BaseTimeBuilder<
    T extends Time, S extends Impl<T>> extends Builder<T, S> {
    public hour(hour: number): this {
        this.getImpl().hour = hour
        return this
    }

    public minute(minute: number): this {
        this.getImpl().minute = minute
        return this
    }

    public second(second: number): this {
        this.getImpl().second = second
        return this
    }

    public millisecond(millisecond: number): this {
        this.getImpl().millisecond = millisecond
        return this
    }

    public microsecond(microsecond: number): this {
        this.getImpl().microsecond = microsecond
        return this
    }

    protected get daa(): readonly string[] {
        return BaseTimeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'hour',
        'minute',
        'second',
        'millisecond',
        'microsecond',
    ]
}

export class TimeBuilder extends BaseTimeBuilder<Time, TimeImpl> {
    public constructor(obj?: Readonly<Time>) {
        const impl = new TimeImpl()
        if (obj)
            TimeBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export class TimeDeltaBuilder extends BaseTimeBuilder<TimeDelta, TimeImpl> {
    public constructor(obj?: Readonly<TimeDelta>) {
        const impl = new TimeImpl()
        if (obj)
            TimeDeltaBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    protected preBuildHook(): void {
        if (this.getImpl().hour === undefined)
            this.getImpl().hour = 0
        if (this.getImpl().minute === undefined)
            this.getImpl().minute = 0
        if (this.getImpl().second === undefined)
            this.getImpl().second = 0
        if (this.getImpl().millisecond === undefined)
            this.getImpl().millisecond = 0
        if (this.getImpl().microsecond === undefined)
            this.getImpl().microsecond = 0
    }
}
