import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface RefToken {
    readonly image: string
    readonly type: RefTokenType
}

class RefTokenImpl implements Impl<RefToken> {
    public image!: string
    public type!: RefTokenType
}

export class RefTokenBuilder extends Builder<RefToken, RefTokenImpl> {
    public constructor(obj?: Readonly<RefToken>) {
        const impl = new RefTokenImpl()
        if (obj)
            RefTokenBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    public type(type: RefTokenType): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return RefTokenBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'image',
        'type',
    ]
}

export function isRefToken(value: unknown): value is RefToken {
    return value instanceof RefTokenImpl
}

export function assertIsRefToken(value: unknown): asserts value is RefToken {
    if (!(value instanceof RefTokenImpl))
        throw Error('Not a RefToken!')
}

export const enum RefTokenType {
    SPLITTER, // !
    KEYWORD, // ALL, THIS
    PART,
    LABEL_START, // [[
    LABEL,
    LABEL_SPLITTER, // ,
    LABEL_END, // ]]
    REF_START,
    REF_END,
    WS, // Whitespace
    AT, // @
    ALIAS,
}
