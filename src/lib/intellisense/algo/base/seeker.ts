import {Builder} from '@logi/base/ts/common/builder'

import {EmptyStrategy, Seeker, Target, TargetBuilder} from '../seeker'

type Matcher = (
    input: string,
    beMatched: readonly string[],
    caseSentitive: boolean,
) => readonly (readonly [string, Map<number, number>])[]

class BaseSeekerImpl implements Seeker {
    public emptyStrategy = EmptyStrategy.EMPTY

    public caseSensitive = false

    public data!: readonly string[]
    public executor!: Matcher
    public seek(seg: string): readonly Readonly<Target>[] {
        if (seg === '' && this.emptyStrategy === EmptyStrategy.ALL)
            return this.data.map((c: string): Target => new TargetBuilder()
                .content(c)
                .matchedMap(new Map<number, number>())
                .build())
        if (seg === '')
            return []
        const result = this.executor(seg, this.data, this.caseSensitive)
        return result.map((item: readonly [string, Map<number, number>]):
            Target =>
            new TargetBuilder().content(item[0]).matchedMap(item[1]).build(),
        )
    }
}

export class BaseSeekerBuilder extends Builder<Seeker, BaseSeekerImpl> {
    public constructor(obj?: Readonly<Seeker>) {
        const impl = new BaseSeekerImpl()
        if (obj)
            BaseSeekerBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public data(value: readonly string[]): this {
        this.getImpl().data = value
        return this
    }

    public executor(fn: Matcher): this {
        this.getImpl().executor = fn
        return this
    }

    public emptyStrategy(value: EmptyStrategy): this {
        this.getImpl().emptyStrategy = value
        return this
    }

    public caseSensitive(value: boolean): this {
        this.getImpl().caseSensitive = value
        return this
    }

    protected static __DAA_PROPS__: readonly string[] = ['data', 'executor']

    protected get daa(): readonly string[] {
        return BaseSeekerBuilder.__DAA_PROPS__
    }
}
