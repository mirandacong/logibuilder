import {Builder} from '@logi/base/ts/common/builder'

import {ViewType} from './part_type'

/**
 * Determine the representation of a candidate displayed in the pannel.
 */
export interface ViewPart {
    readonly content: string
    /**
     * A map to show the matched relationship between the user input and the
     * suggestion.
     */
    readonly matchedMap: Map<number, number>
    readonly type: ViewType
}

class ViewPartImpl implements ViewPart {
    public content!: string
    public matchedMap = new Map<number, number>()
    public type!: ViewType
}

export class ViewPartBuilder extends Builder<ViewPart, ViewPartImpl> {
    public constructor(obj?: Readonly<ViewPart>) {
        const impl = new ViewPartImpl()
        if (obj)
            ViewPartBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public content(value: string): this {
        this.getImpl().content = value
        return this
    }

    public matchedMap(value: Map<number, number>): this {
        this.getImpl().matchedMap = value
        return this
    }

    public type(value: ViewType): this {
        this.getImpl().type = value
        return this
    }

    protected get daa(): readonly string[] {
        return ViewPartBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['type']
}
