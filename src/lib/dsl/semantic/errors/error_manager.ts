import {
    isOperator,
    isReference,
    Node as Est,
} from '@logi/src/lib/dsl/semantic/est'

import {ExprError, ExprErrorBuilder, ExprErrorType} from './error'

export interface ErrorStorage {
    // tslint:disable-next-line: readonly-array
    readonly udfRef: ReadonlyMap<string, ExprError[]>
    // tslint:disable-next-line: readonly-array
    readonly funcError: ReadonlyMap<string, ExprError[]>
    // tslint:disable-next-line: readonly-array
    readonly grammarError: ReadonlyMap<string, ExprError[]>
}

export class ErrorManager implements ErrorStorage {
        // tslint:disable-next-line: readonly-array
    public udfRef = new Map<string, ExprError[]>()
    // tslint:disable-next-line: readonly-array
    public funcError = new Map<string, ExprError[]>()
    // tslint:disable-next-line: readonly-array
    public grammarError = new Map<string, ExprError[]>()
    public clearFb(fb: string): void {
        this.udfRef.delete(fb)
        this.funcError.delete(fb)
        this.grammarError.delete(fb)
    }

    public checkEst(fb: string, est: Readonly<Est>): void {
        const errors = visitorEst(est)
        this.setError(fb, errors)
    }

    public setError(fb: string, errors: readonly ExprError[]): void {
        const udf = errors.filter(e => e.type === ExprErrorType.UDF_REF)
        const func = errors.filter(e => e.type === ExprErrorType.FUNCTION)
        const grammar = errors.filter(e => e.type === ExprErrorType.GRAMMAR)
        const oriUdf = this.udfRef.get(fb)
        if (oriUdf !== undefined)
            oriUdf.push(...udf)
        else if (udf.length !== 0)
            this.udfRef.set(fb, udf)
        const oriFunc = this.funcError.get(fb)
        if (oriFunc !== undefined)
            oriFunc.push(...func)
        else if (func.length !== 0)
            this.funcError.set(fb, func)
        const oriGrammar = this.grammarError.get(fb)
        if (oriGrammar !== undefined)
            oriGrammar.push(...grammar)
        else if (grammar.length !== 0)
            this.grammarError.set(fb, grammar)
    }
}

function visitorEst(root: Readonly<Est>): readonly ExprError[] {
    if (isReference(root)) {
        if (root.hierarchyNode !== undefined)
            return []
        return [new ExprErrorBuilder()
            .type(ExprErrorType.UDF_REF)
            .message(root.path.toString())
            .build()]
    }
    if (!isOperator(root))
        return []
    const errors: ExprError[] = []
    root.children.forEach((c: Readonly<Est>): void => {
        const subErrs = visitorEst(c)
        errors.push(...subErrs)
    })
    return errors
}
