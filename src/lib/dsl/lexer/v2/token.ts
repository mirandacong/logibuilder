import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Token {
    /**
     * The text representation of this Token.
     */
    readonly image: string

    readonly type: Type
}

class TokenImpl implements Impl<Token> {
    public image!: string
    public type!: Type
}

export class TokenBuilder extends Builder<Token, TokenImpl> {
    public constructor(obj?: Readonly<Token>) {
        const impl = new TokenImpl()
        if (obj)
            TokenBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return TokenBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'image',
        'type',
    ]
}

export function isToken(value: unknown): value is Token {
    return value instanceof TokenImpl
}

export function assertIsToken(value: unknown): asserts value is Token {
    if (!(value instanceof TokenImpl))
        throw Error('Not a Token!')
}

// tslint:disable-next-line: const-enum
export enum Type {
    BRA,
    COMMA,
    CONSTANT,
    STRING,
    DATE,
    METHOD,
    DOUBLE_COLON,
    ERROR,
    FUNC,
    KET,
    KEYWORD,
    /**
     * Specifically binary operator.
     */
    OP,
    UNARY_OP,
    REF,
    SLICE,
    // Whitespaces.
    WS,
}
