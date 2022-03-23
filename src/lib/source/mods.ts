import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Source} from './base'
import {getSourceId, Item, ItemBuilder, Manager} from './manager'

export interface SetSourceModification extends Modification {
    readonly row: string
    readonly col: string
    readonly source: Source
}

class SetSourceModificationImpl implements Impl<SetSourceModification> {
    public row!: string
    public col!: string
    public source!: Source
    public do(manager: Manager): void {
        const sourceId = getSourceId(this.row, this.col)
        this._sourceIdx = manager.map.get(sourceId)
        const item = new ItemBuilder()
            .row(this.row)
            .col(this.col)
            .source(this.source)
            .build()
        if (this._sourceIdx !== undefined) {
            this._lastItem = manager.data[this._sourceIdx]
            manager.data[this._sourceIdx] = item
            return
        }
        manager.data.push(item)
        manager.map.set(sourceId, manager.data.length - 1)
    }

    public undo(manager: Manager): void {
        if (this._sourceIdx !== undefined) {
            manager.data[this._sourceIdx] = this._lastItem
            return
        }
        manager.data.pop()
        const sourceId = getSourceId(this.row, this.col)
        manager.map.delete(sourceId)
    }

    private _lastItem!: Item
    private _sourceIdx?: number
}

export class SetSourceModificationBuilder
    extends Builder<SetSourceModification, SetSourceModificationImpl> {
    public constructor(obj?: Readonly<SetSourceModification>) {
        const impl = new SetSourceModificationImpl()
        if (obj)
            SetSourceModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public source(source: Source): this {
        this.getImpl().source = source
        return this
    }

    protected get daa(): readonly string[] {
        return SetSourceModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
        'source',
    ]
}
