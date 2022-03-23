import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {EditorLocation} from '../editor/events/base'

import {Filter} from './solutions/filter'

/**
 * Include all the information for provider to suggest candidates.
 */
export interface Hint {
    /**
     * The segment that causes this suggestions.
     */
    readonly text: string
    /**
     * The prefix string before this text.
     */
    readonly prefix: string
    readonly suffix: string
    /**
     * Some conditions user provides that should be satisfied first.
     */
    readonly filters: readonly Filter[]
    /**
     * The location where this intellisense accurs.
     */
    readonly location: Readonly<EditorLocation>
}

class HintImpl implements Impl<Hint> {
    public text!: string
    public filters: readonly Filter[] = []
    public prefix!: string
    public suffix!: string
    public location!: Readonly<EditorLocation>
}

export class HintBuilder extends Builder<Hint, HintImpl> {
    public constructor(obj?: Readonly<Hint>) {
        const impl = new HintImpl()
        if (obj)
            HintBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public filters(filters: readonly Filter[]): this {
        this.getImpl().filters = filters
        return this
    }

    public prefix(prefix: string): this {
        this.getImpl().prefix = prefix
        return this
    }

    public suffix(suffix: string): this {
        this.getImpl().suffix = suffix
        return this
    }

    public location(location: Readonly<EditorLocation>): this {
        this.getImpl().location = location
        return this
    }

    protected get daa(): readonly string[] {
        return HintBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'location',
    ]
}

export function isHint(obj: object): obj is Hint {
    return obj instanceof HintImpl
}
