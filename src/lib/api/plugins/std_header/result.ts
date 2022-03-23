import {Builder} from '@logi/base/ts/common/builder'
import {TemplateSet} from '@logi/src/lib/template'

import {Result} from '../base'

export interface StdHeaderResult extends Result {
    readonly templateSet: TemplateSet
}

class StdHeaderResultImpl implements StdHeaderResult {
    public actionType!: number
    public templateSet!: TemplateSet
}

export class StdHeaderResultBuilder extends
    Builder<StdHeaderResult, StdHeaderResultImpl> {
    public constructor(obj?: Readonly<StdHeaderResult>) {
        const impl = new StdHeaderResultImpl()
        if (obj)
            StdHeaderResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public templateSet(templateSet: TemplateSet): this {
        this.getImpl().templateSet = templateSet
        return this
    }

    protected get daa(): readonly string[] {
        return StdHeaderResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'templateSet',
    ]
}

export function isTemplateSetResult(value: unknown): value is StdHeaderResult {
    return value instanceof StdHeaderResultImpl
}

export function assertIsTemplateSetResult(
    value: unknown,
): asserts value is StdHeaderResult {
    if (!(value instanceof StdHeaderResultImpl))
        throw Error('Not a TemplateSetResult!')
}
