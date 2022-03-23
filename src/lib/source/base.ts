import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export enum SourceType {
    TYPE_UNSPECIFIED = 0,
    RESPONSE = 1,
    RESULT = 2,
    MANUAL = 3,
    DATABASE = 4,
}

export type SourceValue = number | string

export interface Source {
    readonly value: SourceValue
    readonly sourceType: SourceType
}

export abstract class SourceImpl implements Source {
    public abstract readonly sourceType: SourceType
    public abstract readonly value: SourceValue
}

export class SourceBuilder<T extends Source, S extends Impl<T>> extends
    Builder<T, S> {
    protected get daa(): readonly string[] {
        return SourceBuilder.__DAA_PROPS__
    }

    public value(value: SourceValue): this {
        this.getImpl().value = value
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['uuid']
}

export function isSource(obj: unknown): obj is Source {
    return obj instanceof SourceImpl
}
