import {Impl} from '@logi/base/ts/common/mapped_types'

import {Source, SourceBuilder, SourceImpl, SourceValue} from './base'

/**
 * The value input in `Data` viewed by user.
 */
export type StandardSource = Readonly<Source>

export abstract class StandardSourceImpl
    extends SourceImpl implements StandardSource {
    public value!: SourceValue
}

export class StandardSourceBuilder<T extends StandardSource, S extends Impl<T>>
    extends SourceBuilder<T, S> {
    protected get daa(): readonly string[] {
        return StandardSourceBuilder.__DAA_PROPS__
    }

    public value(value: SourceValue): this {
        const num = Number(value)
        this.getImpl().value = value === '' || isNaN(num) ? value : num
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['value']
}
