import {Address, AddressBuilder} from '@logi/base/ts/common/excel'

import {Block, BlockType, Table as HsfTable} from './defs'
import {getRowCount} from './lib'

/**
 * To get the coordinate.
 */
export class Cursor {
    public constructor(startRow: number, startCol: number) {
        this._row = startRow
        this._col = startCol
    }

    /**
     * Arrive a block.
     */
    public arrive(block: Block): void {
        if (block.type === BlockType.ROW_BLOCK)
            return
        this._adjustCursor(block)
        return
    }

    public arriveTable(table: HsfTable): void {
        const delta = getRowCount(table.getBlocks())
        this._row += delta
        this._col = this._tableStart
    }

    public pointTo(row: number, col: number): void {
        this._row = row
        this._col = col
        return
    }

    /**
     * Get the current blocks address.
     */
    public getAddress(block: Block): readonly Address[] {
        const ignoredType = [
            BlockType.ROW_BLOCK,
        ]
        if (ignoredType.includes(block.type))
            return []
        const area = block.area
        const result: Address[] = []
        if (block.merge || block.type === BlockType.COLUMN)
            result.push(new AddressBuilder()
                .row(this._row)
                .col(this._col)
                .build())
        else if (block.type === BlockType.ROW
            || block.type === BlockType.HEADER_INTERVAL
            || block.type === BlockType.TABLE_END)
            for (let j = 0; j < area.col; j += 1)
                result.push(new AddressBuilder()
                    .row(this._row)
                    .col(j + this._col)
                    .build())
        return result
    }

    public getRow(): number {
        return this._row
    }

    public getCol(): number {
        return this._col
    }

    private _row = 0
    private _col = 0
    // tslint:disable-next-line: readonly-array
    private _blockCache: Address[] = []
    // tslint:disable-next-line: readonly-array
    private _blockChildren: number[] = []

    private _tableCache?: Address
    private _colCount = 0
    private _tableStart = 0

    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    private _adjustCursor(block: Block): void {
        if (block.type === BlockType.LEFT_MARGIN) {
            this._tableStart = block.area.col
            this._col = this._tableStart
            return
        }
        if (block.type === BlockType.TOP_MARGIN) {
            this._row += block.area.col
            this._col = this._tableStart
            return
        }
        if (block.type === BlockType.TITLE) {
            this._row += 1
            this._col = this._tableStart
            return
        }
        if (block.type === BlockType.TABLE_NAME) {
            this._row += 1
            this._col = this._tableStart
            return
        }
        if (block.type === BlockType.ROW_BLOCK)
            return
        if (block.type === BlockType.COLUMN_BLOCK) {
            const cache = new AddressBuilder()
                .row(this._row)
                .col(this._col + block.area.col)
                .build()
            this._blockCache.push(cache)
            this._blockChildren.push(block.childrenCount)
            this._row += 1
            return
        }
        if (block.type === BlockType.COLUMN) {
            this._col += 1
            this._colCount -= 1
            if (this._colCount === 0) {
                this._col = this._tableStart
                this._row = this._tableCache?.row ?? this._row + 1
                this._blockCache = []
                this._blockChildren = []
                return
            }
            let currCount = this._blockChildren.pop()
            while (currCount === 1) {
                if (this._blockCache.length > 0) {
                    // tslint:disable-next-line: no-type-assertion
                    const cache = this._blockCache.pop() as Address
                    this._row = cache.row
                    this._col = cache.col
                }
                currCount = this._blockChildren.pop()
            }
            if (currCount !== undefined)
                this._blockChildren.push(currCount - 1)
            return
        }
        if (block.type === BlockType.ROW) {
            this._row += 1
            this._col = this._tableStart
            return
        }
        if (block.type === BlockType.TABLE) {
            this._tableCache = new AddressBuilder()
                .row(this._row + block.area.row)
                .col(this._col + block.area.col)
                .build()
            this._col += block.area.col
            this._colCount = block.childrenCount
            if (block.childrenCount === 0) {
                this._row += 1
                this._col = this._tableStart
            }
            return
        }
        if (block.type === BlockType.TABLE_END) {
            this._row += block.area.row
            this._col = this._tableStart
            return
        }
        if (block.type === BlockType.HEADER_INTERVAL) {
            this._row += block.area.row
            return
        }
        if (block.type === BlockType.TITLE_INTERVAL) {
            this._row += block.area.row
            this._col = this._tableStart
            return
        }
        this._col = this._tableStart
        this._row += 1
    }
}
