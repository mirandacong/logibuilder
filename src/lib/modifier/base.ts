import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Font, FontBuilder} from './font'
import {Format, FormatBuilder} from './format'

export interface Modifier {
    readonly uuid: string
    readonly format: Format
    readonly font: Font
}

class ModifierImpl implements Impl<Modifier> {
    public uuid!: string
    public format = new FormatBuilder().build()
    public font = new FontBuilder().build()
}

export class ModifierBuilder extends Builder<Modifier, ModifierImpl> {
    public constructor(obj?: Readonly<Modifier>) {
        const impl = new ModifierImpl()
        if (obj)
            ModifierBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public format(format: Format): this {
        this.getImpl().format = format
        return this
    }

    public font(font: Font): this {
        this.getImpl().font = font
        return this
    }

    protected get daa(): readonly string[] {
        return ModifierBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'uuid',
    ]
}

export function isModifier(value: unknown): value is Modifier {
    return value instanceof ModifierImpl
}

export function assertIsModifier(value: unknown): asserts value is Modifier {
    if (!(value instanceof ModifierImpl))
        throw Error('Not a Modifier!')
}
