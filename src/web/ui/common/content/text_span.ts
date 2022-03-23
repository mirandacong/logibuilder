import {Builder} from '@logi/base/ts/common/builder'

export const enum TextSpanType {
    UNKNOWN = 'unknown',
    BASIC = '',
    EMPHASIS = 'emphasis',
    LINK = 'link',
    PATH = 'path',
}

export interface TextSpan {
    readonly text: string
    readonly type: TextSpanType
}

class TextSpanImpl implements TextSpan {
    public text!: string
    public type: TextSpanType = TextSpanType.BASIC
}

export class TextSpanBuilder extends Builder<TextSpan, TextSpanImpl> {
    public constructor(obj?: Readonly<TextSpan>) {
        const impl = new TextSpanImpl()
        if (obj)
            TextSpanBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public type(type: TextSpanType): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return TextSpanBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'text',
    ]
}

export function isTextSpan(value: unknown): value is TextSpan {
    return value instanceof TextSpanImpl
}

export function assertIsTextSpan(value: unknown): asserts value is TextSpan {
    if (!(value instanceof TextSpanImpl))
        throw Error('Not a TextSpan!')
}
