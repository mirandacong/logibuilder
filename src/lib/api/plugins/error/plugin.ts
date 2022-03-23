import {debugTimer} from '@logi/base/ts/common/debug'
import {isRedoPayload, isUndoPayload} from '@logi/src/lib/api/payloads'
import {BookPlugin} from '@logi/src/lib/api/plugins/book'
import {ExprError} from '@logi/src/lib/dsl/semantic'
import {isFormulaBearer} from '@logi/src/lib/hierarchy/core'
import {BehaviorSubject} from 'rxjs'

import {Plugin as Base, PluginType, Product} from '../base'
import {Plugin as ExprPlugin} from '../expr/plugin'
import {FormBuilder} from '../form'

import {ErrorInfo, ErrorInfoBuilder, ErrorType} from './error_info'
import {ErrorResult, ErrorResultBuilder} from './result'

export class Plugin extends Base<ErrorResult> {
    public constructor(
        private readonly _book: BookPlugin,
        private readonly _expr: ExprPlugin,
    ) {
        super()
    }
    public type = PluginType.ERROR
    public result$ = new BehaviorSubject<ErrorResult>(
        new ErrorResultBuilder().actionType(1).build())
    @debugTimer('error plugin')
    public handle(input: Readonly<Product>): void {
        if (!this._shouldUpdate(input))
            return
        this._errors = []
        this._updateFbErrors()
        this.result$.next(new ErrorResultBuilder()
            .actionType(input.actionType)
            .errors(this._errors)
            .build())
    }
    // tslint:disable-next-line: readonly-array
    private _errors: ErrorInfo[] = []
    private _updateFbErrors(): void {
        const formulaErrors: ErrorInfo[] = []
        formulaErrors.push(...this._getFormulaError())
        formulaErrors.push(...this._getInvalidNodes())
        this._errors.push(...formulaErrors)
    }

    // tslint:disable-next-line: prefer-function-over-method
    private _shouldUpdate(input: Readonly<Product>): boolean {
        return input.changed.includes(PluginType.BOOK) ||
            input.payloads.find(isUndoPayload) !== undefined ||
            input.payloads.find(isRedoPayload) !== undefined
    }

    private _getFormulaError(): readonly ErrorInfo [] {
        const result: ErrorInfo[] = []
        const em = this._expr.exprManager
        const udfErr = this
            ._getError(em.errorStorage.udfRef, ErrorType.UNDEFINED)
        result.push(...udfErr)
        const funcErr = this
            ._getError(em.errorStorage.funcError, ErrorType.FUNCTION)
        result.push(...funcErr)
        const grammarErr = this
            ._getError(em.errorStorage.grammarError, ErrorType.GRAMMAR)
        result.push(...grammarErr)
        return result
    }

    private _getError(
        map: ReadonlyMap<string, readonly ExprError[]>,
        type: ErrorType,
    ): readonly ErrorInfo[] {
        const result: ErrorInfo[] = []
        map.forEach((errors: readonly ExprError[], uuid: string): void => {
            const fb = this._book.nodesMap.get(uuid)
            if (!isFormulaBearer(fb))
                return
            const path = fb.getPath().toString()
            errors.forEach((e: ExprError): void => {
                result.push(new ErrorInfoBuilder()
                    .node(uuid)
                    .nodePath(path)
                    .errorType(type)
                    .errorMsg(e.message)
                    .build())
            })
        })
        return result
    }

    private _getInvalidNodes(): readonly ErrorInfo[] {
        const result: ErrorInfo[] = []
        this._book.invalidNodes.forEach((uuid: string): void => {
            const fb = this._book.nodesMap.get(uuid)
            if (!isFormulaBearer(fb))
                return
            const err = new ErrorInfoBuilder()
                .node(uuid)
                .nodePath(fb.getPath().toString())
                .errorType(ErrorType.DULPLICATE_NAME)
                .errorMsg('同路径下存在同名冲突,请修改名字或添加别名')
                .build()
            result.push(err)
        })
        return result
    }
}

export const ERROR_FORM = new FormBuilder()
    .type(PluginType.ERROR)
    .deps([
        PluginType.BOOK,
        PluginType.EXPR,
    ])
    .ctor(Plugin)
    .build()
