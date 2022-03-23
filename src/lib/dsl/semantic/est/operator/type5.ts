import {
    FormulaInfo,
    FormulaInfoBuilder,
    HEADLESS,
    SubFormulaInfo,
    ValidateRule,
} from '../node'

import {Operator as BaseOperator, OperatorType} from './base'
import {TYPE5_REGISTRY} from './registry'
import {getOp} from './utils'
import {getValidateRule} from './validate'

export class Operator extends BaseOperator {
    public static supportedOpNames(): readonly string[] {
        return Operator.__SUPPORTED_OP_NAMES__
    }
    public readonly opType = OperatorType.TYPE5

    protected readonly validateRules: readonly ValidateRule[] = VALIDATE_RULES

    protected buildFormulaInfo(): readonly FormulaInfo[] {
        return [new FormulaInfoBuilder()
            .head(HEADLESS)
            .inNodes([])
            .op(getOp(this.image))
            .build()]
    }

    // tslint:disable-next-line: prefer-function-over-method no-unused
    protected collectFormulaInfo(): readonly SubFormulaInfo[] {
        return []
    }
    private static __SUPPORTED_OP_NAMES__: readonly string[] =
        ['empty']
}

const VALIDATE_RULES = TYPE5_REGISTRY.map(getValidateRule)
