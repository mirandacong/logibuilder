import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {FormulaManager} from '@logi/src/lib/formula'

import {Result} from '../base'

export interface FormulaResult extends Result {
    readonly actionType: number
    readonly formulaManager: FormulaManager
}

class FormulaResultImpl implements Impl<FormulaResult> {
    public actionType!: number
    public formulaManager!: FormulaManager
}

export class FormulaResultBuilder
    extends Builder<FormulaResult, FormulaResultImpl> {
    public constructor(obj?: Readonly<FormulaResult>) {
        const impl = new FormulaResultImpl()
        if (obj)
            FormulaResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public formulaManager(formulaManager: FormulaManager): this {
        this.getImpl().formulaManager = formulaManager
        return this
    }

    protected get daa(): readonly string[] {
        return FormulaResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'formulaManager',
    ]
}

export function isFormulaResult(value: unknown): value is FormulaResult {
    return value instanceof FormulaResultImpl
}

export function assertIsFormulaResult(
    value: unknown,
): asserts value is FormulaResult {
    if (!(value instanceof FormulaResultImpl))
        throw Error('Not a FormulaResult!')
}
