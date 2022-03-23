import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
/**
 * The error occurs during lexing.
 *
 * It can help us find out how to correct the expression.
 */
export interface Error {
    readonly type: ErrorType
    readonly image: string
    readonly msg: string
}

class ErrorImpl implements Impl<Error> {
    public type!: ErrorType
    public image = ''
    public msg = ''
}

export class ErrorBuilder extends Builder<Error, ErrorImpl> {
    public constructor(obj?: Readonly<Error>) {
        const impl = new ErrorImpl()
        if (obj)
            ErrorBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: ErrorType): this {
        this.getImpl().type = type
        return this
    }

    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    public msg(msg: string): this {
        this.getImpl().msg = msg
        return this
    }

    protected get daa(): readonly string[] {
        return ErrorBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['type']
}

export function isError(value: unknown): value is Error {
    return value instanceof ErrorImpl
}

export function assertIsError(value: unknown): asserts value is Error {
    if (!(value instanceof ErrorImpl))
        throw Error('Not a Error!')
}

// tslint:disable-next-line: const-enum
export enum ErrorType {
    // This error is generated during the error recovery. Indicating that
    // removing the string in the image helps lexer works fine.
    UNRECORGNIZED,
    // Expected some characters like `)` to close the brackets.
    EXPECTED,
    UNEXPECTED_END,
}
