import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
export interface FocusConfig {
    readonly focus: boolean
    readonly manualBlur: boolean
}

class FocusConfigImpl implements Impl<FocusConfig> {
    public focus!: boolean
    public manualBlur = false
}

export class FocusConfigBuilder extends Builder<FocusConfig, FocusConfigImpl> {
    public constructor(obj?: Readonly<FocusConfig>) {
        const impl = new FocusConfigImpl()
        if (obj)
            FocusConfigBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public focus(focus: boolean): this {
        this.getImpl().focus = focus
        return this
    }

    public manualBlur(manualBlur: boolean): this {
        this.getImpl().manualBlur = manualBlur
        return this
    }

    protected get daa(): readonly string[] {
        return FocusConfigBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'focus',
    ]
}

export function isFocusConfig(value: unknown): value is FocusConfig {
    return value instanceof FocusConfigImpl
}

export function assertIsFocusConfig(
    value: unknown,
): asserts value is FocusConfig {
    if (!(value instanceof FocusConfigImpl))
        throw Error('Not a FocusConfig!')
}
