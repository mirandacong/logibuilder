import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
export const enum ErrorType {
    UNKNOWN,
    UNDEFINED,
    GRAMMAR,
    FUNCTION,
    DULPLICATE_NAME,
}
export interface ErrorInfo {
    /**
     * hierarchy node or slice uuid.
     */
    readonly node: string
    readonly nodePath: string
    readonly errorMsg: string
    readonly errorType: ErrorType
    equals(err: ErrorInfo): boolean
}

class ErrorInfoImpl implements Impl<ErrorInfo> {
    public node!: string
    public nodePath!: string
    public errorMsg!: string
    public errorType!: ErrorType
    public equals(err: ErrorInfo): boolean {
        return err.node === this.node
            && err.nodePath === this.nodePath
            && err.errorMsg === this.errorMsg
            && err.errorType === this.errorType
    }
}

export class ErrorInfoBuilder extends Builder<ErrorInfo, ErrorInfoImpl> {
    public constructor(obj?: Readonly<ErrorInfo>) {
        const impl = new ErrorInfoImpl()
        if (obj)
            ErrorInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: string): this {
        this.getImpl().node = node
        return this
    }

    public nodePath(nodePath: string): this {
        this.getImpl().nodePath = nodePath
        return this
    }

    public errorMsg(errorMsg: string): this {
        this.getImpl().errorMsg = errorMsg
        return this
    }

    public errorType(errorType: ErrorType): this {
        this.getImpl().errorType = errorType
        return this
    }

    protected get daa(): readonly string[] {
        return ErrorInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'node',
        'nodePath',
        'errorMsg',
    ]
}

export function isErrorInfo(value: unknown): value is ErrorInfo {
    return value instanceof ErrorInfoImpl
}

export function assertIsErrorInfo(value: unknown): asserts value is ErrorInfo {
    if (!(value instanceof ErrorInfoImpl))
        throw Error('Not a ErrorInfo!')
}
