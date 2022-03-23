import {Builder} from '@logi/base/ts/common/builder'

import {TextSpan} from './text_span'

export interface TextLine {
    readonly spans: readonly TextSpan[]
}

class TextLineImpl implements TextLine {
    public spans: readonly TextSpan[] = []
}

export class TextLineBuilder extends Builder<TextLine, TextLineImpl> {
    public constructor(obj?: Readonly<TextLine>) {
        const impl = new TextLineImpl()
        if (obj)
            TextLineBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public spans(spans: readonly TextSpan[]): this {
        this.getImpl().spans = spans
        return this
    }
}

export function isTextLine(value: unknown): value is TextLine {
    return value instanceof TextLineImpl
}

export function assertIsTextLine(value: unknown): asserts value is TextLine {
    if (!(value instanceof TextLineImpl))
        throw Error('Not a TextLine!')
}
