import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Cursor} from './cursor'
import {Book as HsfBook, Table as HsfTable} from './defs'

export interface BlockPosition {
    readonly sheetName: string
    readonly table: HsfTable
    readonly idx: number
    readonly startRow: number
    readonly startCol: number
}

class BlockPositionImpl implements Impl<BlockPosition> {
    public sheetName!: string
    public table!: HsfTable
    public idx!: number
    public startRow!: number
    public startCol!: number
}

export class BlockPositionBuilder extends
    Builder<BlockPosition, BlockPositionImpl> {
    public constructor(obj?: Readonly<BlockPosition>) {
        const impl = new BlockPositionImpl()
        if (obj)
            BlockPositionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheetName(sheetName: string): this {
        this.getImpl().sheetName = sheetName
        return this
    }

    public table(table: HsfTable): this {
        this.getImpl().table = table
        return this
    }

    public idx(idx: number): this {
        this.getImpl().idx = idx
        return this
    }

    public startRow(startRow: number): this {
        this.getImpl().startRow = startRow
        return this
    }

    public startCol(startCol: number): this {
        this.getImpl().startCol = startCol
        return this
    }

    protected get daa(): readonly string[] {
        return BlockPositionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'idx', 'sheetName', 'table', 'startRow', 'startCol']
}

export function findBlock(
    hsf: HsfBook,
    uuid: string,
): BlockPosition | undefined {
    for (const s of hsf.sheets) {
        const cursor = new Cursor(0, 0)
        cursor.arrive(s.margin)
        for (const table of s.data) {
            let i = 0
            for (const b of table.getBlocks()) {
                if (b.uuid !== uuid) {
                    i += 1
                    cursor.arrive(b)
                    continue
                }
                return new BlockPositionBuilder()
                    .idx(i)
                    .sheetName(s.name)
                    .table(table)
                    .startRow(cursor.getRow())
                    .startCol(cursor.getCol())
                    .build()
            }
        }
    }
    return
}
