import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Token {
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
    protected static readonly __DAA_PROPS__: readonly string[] = ['image', 'type']
}

export function isToken(value: unknown): value is Token {
    return value instanceof TokenImpl
}

export function assertIsToken(value: unknown): asserts value is Token {
    if (!(value instanceof TokenImpl))
        throw Error('Not a Token!')
}

export const enum Type {
    AND,
    BRA,
    KET,
    NOT,
    OR,
    VALUE,
    UNARY,
    WS,
}

export function getPrecedence(type: Type): number {
    switch (type) {
    case Type.AND:
        // tslint:disable-next-line: no-magic-numbers
        return 5
    case Type.OR:
        return 1
    case Type.NOT:
        // tslint:disable-next-line: no-magic-numbers
        return 10
    default:
    }
    return 0
}
