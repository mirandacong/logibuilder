import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {SourceManager} from '@logi/src/lib/source'

import {Result} from '../base'

export interface SourceResult extends Result {
    readonly actionType: number
    readonly sourceManager: SourceManager
}

class SourceResultImpl implements Impl<SourceResult> {
    public actionType!: number
    public sourceManager!: SourceManager
}

export class SourceResultBuilder extends
    Builder<SourceResult, SourceResultImpl> {
    public constructor(obj?: Readonly<SourceResult>) {
        const impl = new SourceResultImpl()
        if (obj)
            SourceResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public sourceManager(sourceManager: SourceManager): this {
        this.getImpl().sourceManager = sourceManager
        return this
    }

    protected get daa(): readonly string[] {
        return SourceResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'sourceManager',
    ]
}

export function isSourceResult(value: unknown): value is SourceResult {
    return value instanceof SourceResultImpl
}

export function assertIsSourceResult(
    value: unknown,
): asserts value is SourceResult {
    if (!(value instanceof SourceResultImpl))
        throw Error('Not a SourceResult!')
}
