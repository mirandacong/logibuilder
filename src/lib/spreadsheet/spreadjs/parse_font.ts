import {Builder} from '@logi/base/ts/common/builder'

/**
 * TODO: The spreadjs font use css font format, find a better way to parse it.
 */
export function parseFont(fontStr: string): Font {
    const italic = fontStr.includes('italic')
    const bold = fontStr.includes('bold')
    const splits = fontStr.trim().split(/ +/)
    const size = splits.find(s => s.endsWith('px') || s.endsWith('pt')) ?? ''
    const family = splits[splits.length - 1] ?? ''
    return new FontBuilder()
        .italic(italic)
        .bold(bold)
        .size(size)
        .family(family)
        .build()
}

export function stringifyFont(font: Font): string {
    const fontStrs: string[] = []
    fontStrs.push(font.italic ? 'italic' : 'normal')
    fontStrs.push(font.bold ? 'bold' : 'normal')
    fontStrs.push(font.size)
    fontStrs.push(font.family)
    return fontStrs.join(' ')
}

export interface Font {
    readonly italic: boolean
    readonly bold: boolean
    readonly size: string
    readonly family: string
}

class FontImpl implements Font {
    public italic!: boolean
    public bold!: boolean
    public size = ''
    public family = ''
}

export class FontBuilder extends Builder<Font, FontImpl> {
    public constructor(obj?: Readonly<Font>) {
        const impl = new FontImpl()
        if (obj)
            FontBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    public bold(bold: boolean): this {
        this.getImpl().bold = bold
        return this
    }

    public size(size: string): this {
        this.getImpl().size = size
        return this
    }

    public family(family: string): this {
        this.getImpl().family = family
        return this
    }

    protected get daa(): readonly string[] {
        return FontBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'italic',
        'bold',
        'size',
        'family',
    ]
}
