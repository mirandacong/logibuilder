import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Seeker {
    readonly emptyStrategy: EmptyStrategy
    readonly caseSensitive: boolean
    seek(seg: string | readonly string[]): readonly Readonly<Target>[]
}

/**
 * Indicate the result which is found according to segments.
 */
export interface Target {
    readonly content: string
    readonly matchedMap: Map<number, number>
}

class TargetImpl implements Impl<Target> {
    public content!: string
    public matchedMap!: Map<number, number>
}

export class TargetBuilder extends Builder<Target, TargetImpl> {
    public constructor(obj?: Readonly<Target>) {
        const impl = new TargetImpl()
        if (obj)
            TargetBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public content(content: string): this {
        this.getImpl().content = content
        return this
    }

    public matchedMap(matchedMap: Map<number, number>): this {
        this.getImpl().matchedMap = matchedMap
        return this
    }
}

export const enum EmptyStrategy {
    ALL,
    EMPTY,
}
