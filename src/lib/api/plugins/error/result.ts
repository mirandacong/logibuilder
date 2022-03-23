import {Impl} from '@logi/base/ts/common/mapped_types'

import {Result, ResultBaseBuilder} from '../base'

import {ErrorInfo} from './error_info'
export interface ErrorResult extends Result {
    readonly errors: readonly ErrorInfo[]
}

class ErrorResultImpl implements Impl<ErrorResult> {
    public errors: readonly ErrorInfo[] = []
}

export class ErrorResultBuilder extends
ResultBaseBuilder<ErrorResult, ErrorResultImpl> {
    public constructor(obj?: Readonly<ErrorResult>) {
        const impl = new ErrorResultImpl()
        if (obj)
            ErrorResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public errors(errors: readonly ErrorInfo[]): this {
        this.getImpl().errors = errors
        return this
    }

    protected get daa(): readonly string[] {
        return ErrorResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...ResultBaseBuilder.__DAA_PROPS__,
    ]
}

export function isErrorResult(value: unknown): value is ErrorResult {
    return value instanceof ErrorResultImpl
}

export function assertIsErrorResult(
    value: unknown,
): asserts value is ErrorResult {
    if (!(value instanceof ErrorResultImpl))
        throw Error('Not a ErrorResult!')
}
