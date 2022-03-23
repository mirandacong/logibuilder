import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export const enum ExprErrorType {
    UDF_REF,
    GRAMMAR,
    FUNCTION,
}
export interface ExprError {
    readonly type: ExprErrorType
    readonly message: string
}

class ExprErrorImpl implements Impl<ExprError> {
    public type!: ExprErrorType
    public message!: string
}

export class ExprErrorBuilder extends Builder<ExprError, ExprErrorImpl> {
    public constructor(obj?: Readonly<ExprError>) {
        const impl = new ExprErrorImpl()
        if (obj)
            ExprErrorBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: ExprErrorType): this {
        this.getImpl().type = type
        return this
    }

    public message(message: string): this {
        this.getImpl().message = message
        return this
    }

    protected get daa(): readonly string[] {
        return ExprErrorBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'type',
        'message',
    ]
}

export function isExprError(value: unknown): value is ExprError {
    return value instanceof ExprErrorImpl
}
