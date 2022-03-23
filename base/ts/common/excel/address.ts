import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Address {
    readonly row: number
    readonly col: number
    readonly sheetName: string
    readonly uuid: string
}

class AddressImpl implements Impl<Address> {
    public row!: number
    public col!: number
    public sheetName = ''
    public get uuid(): string {
        return `${this.sheetName}-${this.row}-${this.col}`
    }
}

export class AddressBuilder extends Builder<Address, AddressImpl> {
    public constructor(obj?: Readonly<Address>) {
        const impl = new AddressImpl()
        if (obj)
            AddressBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: number): this {
        this.getImpl().row = row
        return this
    }

    public col(col: number): this {
        this.getImpl().col = col
        return this
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    protected get daa(): readonly string[] {
        return AddressBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'row',
    ]
}

export function isAddress(value: unknown): value is Address {
    return value instanceof AddressImpl
}

export function assertIsAddress(value: unknown): asserts value is Address {
    if (!(value instanceof AddressImpl))
        throw Error('Not a Address!')
}
