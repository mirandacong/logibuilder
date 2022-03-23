import {Builder} from '@logi/base/ts/common/builder'
import {Underline} from '@logi/base/ts/common/excel'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Font {
    readonly family: FontFamily
    readonly size: number
    readonly bold: boolean
    readonly italic: boolean
    readonly line: Underline
    readonly indent: number
}

class FontImpl implements Impl<Font> {
    public family = FontFamily.CALIBRI
    public size = 10
    public bold = false
    public italic = false
    public line = Underline.NONE
    public indent = 0
}

export class FontBuilder extends Builder<Font, FontImpl> {
    public constructor(obj?: Readonly<Font>) {
        const impl = new FontImpl()
        if (obj)
            FontBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public family(family: FontFamily): this {
        this.getImpl().family = family
        return this
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    public bold(bold: boolean): this {
        this.getImpl().bold = bold
        return this
    }

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    public line(line: Underline): this {
        this.getImpl().line = line
        return this
    }

    public indent(indent: number): this {
        this.getImpl().indent = indent
        return this
    }
}

export function isFont(value: unknown): value is Font {
    return value instanceof FontImpl
}

export function assertIsFont(value: unknown): asserts value is Font {
    if (!(value instanceof FontImpl))
        throw Error('Not a Font!')
}

// tslint:disable-next-line: const-enum
export enum FontFamily {
    CALIBRI = 'Calibri',
}

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
export function isFontFamily(key: string): key is FontFamily {
    // tslint:disable-next-line: no-object
    return Object
        .keys(FontFamily)
        .map((k: string): string => Reflect.get(FontFamily, k))
        .includes(key)
}
