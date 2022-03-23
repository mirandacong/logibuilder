import {Builder} from '@logi/base/ts/common/builder'
// tslint:disable-next-line: const-enum
export enum SpanType {
    NAME,
    OPERATOR,
}
export interface Span {
    readonly text: string
    readonly type: SpanType
}

class SpanImpl implements Span {
    public text!: string
    public type!: SpanType
}

export class SpanBuilder extends Builder<Span, SpanImpl> {
    public constructor(obj?: Readonly<Span>) {
        const impl = new SpanImpl()
        if (obj)
            SpanBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public type(type: SpanType): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return SpanBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'text',
        'type',
    ]
}

export function isSpan(value: unknown): value is Span {
    return value instanceof SpanImpl
}

export function assertIsSpan(value: unknown): asserts value is Span {
    if (!(value instanceof SpanImpl))
        throw Error('Not a Span!')
}
