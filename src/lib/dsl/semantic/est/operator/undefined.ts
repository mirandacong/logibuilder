import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'

import {FormulaInfo, Node, SubFormulaInfo, ValidateRule} from '../node'

import {isOperator, Operator as BaseOperator, OperatorType} from './base'

export class Operator extends BaseOperator {
    public readonly opType = OperatorType.UNDEFINED

    protected readonly validateRules: readonly ValidateRule[] = [VALIDATE_RULE]

    // tslint:disable-next-line: prefer-function-over-method
    protected buildFormulaInfo(): readonly FormulaInfo[] {
        return []
    }

    // tslint:disable-next-line: prefer-function-over-method
    protected collectFormulaInfo(): readonly SubFormulaInfo[] {
        return []
    }
}

const VALIDATE_RULE = (node: Node): Exception | void => {
    if (!isOperator(node))
        return
    return new ExceptionBuilder().message(`不合法的函数名:${node.image}`).build()
}
