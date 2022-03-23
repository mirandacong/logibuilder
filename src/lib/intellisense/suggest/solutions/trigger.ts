import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'

import {Filter} from './filter'

/**
 * An internal product in the piping process in adviser. Simplify the
 * in all the information for provider to get candidates.
 */
export interface Trigger {
    /**
     * The text user editting which we used to find out the candidates.
     */
    readonly text: string
    /**
     * The type to tell which providers should serves this trigger.
     */
    readonly type: TriggerType
    /**
     * The hierachy node which adheres to the editor.
     *
     * Some providers need to know this information/
     */
    readonly node: Readonly<Node>
    readonly filters: readonly Readonly<Filter>[]

    readonly prefix: string
    readonly suffix: string
    readonly from: string
}

class TriggerImpl implements Impl<Trigger> {
    public text!: string
    public type!: TriggerType
    public node!: Readonly<Node>
    public prefix = ''
    public suffix = ''
    public from = ''
    public filters: readonly Readonly<Filter>[] = []
}

export class TriggerBuilder extends Builder<Trigger, TriggerImpl> {
    public constructor(obj?: Readonly<Trigger>) {
        const impl = new TriggerImpl()
        if (obj)
            TriggerBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public type(type: TriggerType): this {
        this.getImpl().type = type
        return this
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    public suffix(value: string): this {
        this.getImpl().suffix = value
        return this
    }

    public prefix(value: string): this {
        this.getImpl().prefix = value
        return this
    }

    public filters(value: readonly Readonly<Filter>[]): this {
        this.getImpl().filters = value
        return this
    }

    public from(value: string): this {
        this.getImpl().from = value
        return this
    }

    protected get daa(): readonly string[] {
        return TriggerBuilder.__DAA_PROPS__
    }

    protected static __DAA_PROPS__: readonly string[] = [
        'text',
        'type',
        'node',
    ]
}

export const enum TriggerType {
    REFERENCE,
    PATH,
    FUNC_OR_REF,
    FUNCTION,
    DICT,
    SLICE,
}
