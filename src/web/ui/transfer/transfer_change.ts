import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {TransferDirection} from './direction'
import {TransferItem} from './item'
export interface TransferChange<T> {
    readonly from: TransferDirection
    readonly to: TransferDirection
    readonly list: readonly TransferItem<T>[]
    readonly left: readonly TransferItem<T>[]
    readonly right: readonly TransferItem<T>[]
}

class TransferChangeImpl<T> implements Impl<TransferChange<T>> {
    public from!: TransferDirection
    public to!: TransferDirection
    public list: readonly TransferItem<T>[] = []
    public left: readonly TransferItem<T>[] = []
    public right: readonly TransferItem<T>[] = []
}

export class TransferChangeBuilder<T> extends
Builder<TransferChange<T>, TransferChangeImpl<T>> {
    public constructor(obj?: Readonly<TransferChange<T>>) {
        const impl = new TransferChangeImpl<T>()
        if (obj)
            TransferChangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public from(from: TransferDirection): this {
        this.getImpl().from = from
        return this
    }

    public to(to: TransferDirection): this {
        this.getImpl().to = to
        return this
    }

    public list(list: readonly TransferItem<T>[]): this {
        this.getImpl().list = list
        return this
    }

    public left(left: readonly TransferItem<T>[]): this {
        this.getImpl().left = left
        return this
    }

    public right(right: readonly TransferItem<T>[]): this {
        this.getImpl().right = right
        return this
    }

    protected get daa(): readonly string[] {
        return TransferChangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'from',
        'to',
    ]
}

export function isTransferChange<T>(
    value: unknown,
): value is TransferChange<T> {
    return value instanceof TransferChangeImpl
}

export function assertIsTransferChange<T>(
    value: unknown,
): asserts value is TransferChange<T> {
    if (!(value instanceof TransferChangeImpl))
        throw Error('Not a TransferChange!')
}
