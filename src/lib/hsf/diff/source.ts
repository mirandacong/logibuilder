import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * Indicating that one of the property belows will be updated in the excel book.
 * - Table name
 * - Table stub
 * - Column name
 * - Column block name
 * - Title name
 */
export interface ValueDiff {
    readonly sheetName: string
    /**
     * The uuid of that hsf block that is to be repainted.
     */
    readonly uuid: string
}

class ValueDiffImpl implements Impl<ValueDiff> {
    public sheetName!: string
    public uuid!: string
}

export class ValueDiffBuilder extends Builder<ValueDiff, ValueDiffImpl> {
    public constructor(obj?: Readonly<ValueDiff>) {
        const impl = new ValueDiffImpl()
        if (obj)
            ValueDiffBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public sheetName(name: string): this {
        this.getImpl().sheetName = name
        return this
    }

    protected get daa(): readonly string[] {
        return ValueDiffBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sheetName',
        'uuid',
    ]
}
