import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * Repainting a whole sheet.
 */
export interface SheetDiff {
    readonly type: SheetDiffType
    readonly sheet: string
    /**
     * If type is ADD, the index.
     */
    readonly idx?: number
    /**
     * If type is MOVE, ths original index in excel.
     */
    readonly oriIdx?: number
    /**
     * If type is rename, the old name.
     */
    readonly oldName?: string

    /**
     * If type is RENAME, it is supposed to be undefined. The new name.
     */
    readonly name: string
}

class SheetDiffImpl implements Impl<SheetDiff> {
    public sheet!: string
    public type!: SheetDiffType
    public idx?: number | undefined
    public oriIdx?: number
    public oldName?: string
    public name!: string
}

export class SheetDiffBuilder extends Builder<SheetDiff, SheetDiffImpl> {
    public constructor(obj?: Readonly<SheetDiff>) {
        const impl = new SheetDiffImpl()
        if (obj)
            SheetDiffBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheet(sheet: string): this {
        this.getImpl().sheet = sheet
        return this
    }

    public type(type: SheetDiffType): this {
        this.getImpl().type = type
        return this
    }

    public idx(idx?: number): this {
        this.getImpl().idx = idx
        return this
    }

    public oriIdx(oriIdx?: number): this {
        this.getImpl().oriIdx = oriIdx
        return this
    }

    public oldName(oldName: string): this {
        this.getImpl().oldName = oldName
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return SheetDiffBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'sheet',
        'type',
    ]
}

export function isSheetDiff(value: unknown): value is SheetDiff {
    return value instanceof SheetDiffImpl
}

export function assertIsSheetDiff(value: unknown): asserts value is SheetDiff {
    if (!(value instanceof SheetDiffImpl))
        throw Error('Not a SheetDiff!')
}

export const enum SheetDiffType {
    ADD,
    REPAINT,
    RENAME,
    MOVE,
    REMOVE,
}
