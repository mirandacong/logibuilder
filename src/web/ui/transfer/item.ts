import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {TransferDirection} from './direction'
export interface TransferItem<T> {
    readonly direction: TransferDirection
    readonly name: string
    readonly disabled: boolean
    readonly checked: boolean
    readonly dataNode: T
    updateChecked(checked: boolean): void
    updateDirection(direction: TransferDirection): void
}

class TransferItemImpl<T> implements Impl<TransferItem<T>> {
    public direction!: TransferDirection
    public name!: string
    public disabled = false
    public checked = false
    public dataNode!: T
    public updateChecked(checked: boolean): void {
        this.checked = checked
    }

    public updateDirection(direction: TransferDirection): void {
        this.direction = direction
    }
}

export class TransferItemBuilder<T> extends
Builder<TransferItem<T>, TransferItemImpl<T>> {
    public constructor(obj?: Readonly<TransferItem<T>>) {
        const impl = new TransferItemImpl<T>()
        if (obj)
            TransferItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public direction(direction: TransferDirection): this {
        this.getImpl().direction = direction
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public disabled(disabled: boolean): this {
        this.getImpl().disabled = disabled
        return this
    }

    public checked(checked: boolean): this {
        this.getImpl().checked = checked
        return this
    }

    public dataNode(dataNode: T): this {
        this.getImpl().dataNode = dataNode
        return this
    }

    protected get daa(): readonly string[] {
        return TransferItemBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'direction',
        'name',
        'dataNode',
    ]
}

export function isTransferItem<T>(value: unknown): value is TransferItem<T> {
    return value instanceof TransferItemImpl
}

export function assertIsTransferItem<T>(
    value: unknown,
): asserts value is TransferItem<T> {
    if (!(value instanceof TransferItemImpl))
        throw Error('Not a TransferItem!')
}
