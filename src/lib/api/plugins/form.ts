// tslint:disable: unknown-instead-of-any
import {Builder} from '@logi/base/ts/common/builder'

import {Plugin, PluginType, Result} from './base'

/**
 * Registry form.
 */
export interface Form {
    readonly type: PluginType
    /**
     * Indicating the order these plugins should be built.
     */
    readonly deps: readonly PluginType[]
    /**
     * Indicating the action handling order.
     * If reverse is true, this plugins has higer priority to execute the
     * actions before their deps. Or they has the lower priority than their
     * deps.
     */
    readonly reverse: boolean
    readonly ctor: new (...plugins: readonly Plugin<any>[]) => Plugin<Result>
}

class FormImpl implements Form {
    public type!: PluginType
    public deps: readonly PluginType[] = []
    public reverse = false
    public ctor!: new (...plugins: readonly Plugin<any>[]) => Plugin<Result>
}

export class FormBuilder extends Builder<Form, FormImpl> {
    public constructor(obj?: Readonly<Form>) {
        const impl = new FormImpl()
        if (obj)
            FormBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: PluginType): this {
        this.getImpl().type = type
        return this
    }

    public deps(deps: readonly PluginType[]): this {
        this.getImpl().deps = deps
        return this
    }

    public ctor(ctor: new (...plugins: any) => Plugin<any>): this {
        this.getImpl().ctor = ctor
        return this
    }

    public reverse(reverse: boolean): this {
        this.getImpl().reverse = reverse
        return this
    }

    protected get daa(): readonly string[] {
        return FormBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['type', 'ctor']
}
