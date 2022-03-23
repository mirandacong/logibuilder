import {TransferDirection} from './direction'
import {TransferItem} from './item'

export interface TransferSelectChange<T> {
    readonly direction: TransferDirection
    readonly checked: boolean
    readonly list: readonly TransferItem<T>[]
    readonly item: TransferItem<T>
}
