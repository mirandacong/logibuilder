import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Block} from './block'
import {Table} from './table'

export interface Sheet {
    readonly name: string
    readonly uuid: string
    readonly margin: Block
    /**
     * A hsf sheet contains tables(mainly) and some title blocks.
     */
    readonly data: readonly Table[]
}

class SheetImpl implements Impl<Sheet> {
    public name!: string
    public uuid!: string
    public margin!: Block
    public data: readonly Table[] = []
}

export class SheetBuilder extends Builder<Sheet, SheetImpl> {
    public constructor(obj?: Readonly<Sheet>) {
        const impl = new SheetImpl()
        if (obj)
            SheetBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public margin(margin: Block): this {
        this.getImpl().margin = margin
        return this
    }

    public data(data: readonly Table[]): this {
        this.getImpl().data = data
        return this
    }

    protected get daa(): readonly string[] {
        return SheetBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'uuid',
    ]
}

export function isSheet(value: unknown): value is Sheet {
    return value instanceof SheetImpl
}

export function assertIsSheet(value: unknown): asserts value is Sheet {
    if (!(value instanceof SheetImpl))
        throw Error('Not a Sheet!')
}
