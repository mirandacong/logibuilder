import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
/**
 * A filter user provides to us to get the more accurate suggestions.
 *
 * BTW, we also use filters to group the candidates.
 * NOTE: This is not used currently.
 */
export interface Filter {
    /**
     * The candididate should contains this word.
     */
    readonly value: string
    readonly type: FilterType
}

class FilterImpl implements Impl<Filter> {
    public value!: string
    public type = FilterType.WORD
}

export class FilterBuilder extends Builder<Filter, FilterImpl> {
    public constructor(obj?: Readonly<Filter>) {
        const impl = new FilterImpl()
        if (obj)
            FilterBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public value(word: string): this {
        this.getImpl().value = word
        return this
    }

    public type(t: FilterType): this {
        this.getImpl().type = t
        return this
    }
}

export function isFilter(obj: object): obj is Filter {
    return obj instanceof FilterImpl
}

export const enum FilterType {
    /**
     * Find those candidate whose content contains the given word.
     */
    WORD,
    /**
     * Find those candidate whose refname is the given string.
     */
    // REFNAME,
}
