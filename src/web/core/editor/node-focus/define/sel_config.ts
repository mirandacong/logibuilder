import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface SelConfig {
    readonly multiSelect: boolean
    readonly scrollIntoView: boolean
    readonly isExpand: boolean
    /**
     * If trigger by event, true, else false.
     * If true, will trigger setActiveSheet action.
     */
    readonly trust: boolean
}

class SelConfigImpl implements Impl<SelConfig> {
    public multiSelect!: boolean
    public scrollIntoView = false
    public isExpand = true
    public trust = false
}

export class SelConfigBuilder extends Builder<SelConfig, SelConfigImpl> {
    public constructor(obj?: Readonly<SelConfig>) {
        const impl = new SelConfigImpl()
        if (obj)
            SelConfigBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public multiSelect(multiSelect: boolean): this {
        this.getImpl().multiSelect = multiSelect
        return this
    }

    public scrollIntoView(scrollIntoView: boolean): this {
        this.getImpl().scrollIntoView = scrollIntoView
        return this
    }

    public isExpand(isExpand: boolean): this {
        this.getImpl().isExpand = isExpand
        return this
    }

    public trust(trust: boolean): this {
        this.getImpl().trust = trust
        return this
    }

    protected get daa(): readonly string[] {
        return SelConfigBuilder.__DAA_PROPS__
    }
    protected static __DAA_PROPS__: readonly string[] = [
        'multiSelect',
        'isExpand',
        'scrollIntoView',
    ]
}

export function isSelConfig(value: unknown): value is SelConfig {
    return value instanceof SelConfigImpl
}

export function assertIsSelConfig(value: unknown): asserts value is SelConfig {
    if (!(value instanceof SelConfigImpl))
        throw Error('Not a SelConfig!')
}
