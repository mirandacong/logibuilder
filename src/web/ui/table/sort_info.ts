import {MatSortable} from '@angular/material/sort'
import {Builder} from '@logi/base/ts/common/builder'

export type Start = 'asc' | 'desc'
// tslint:disable-next-line: no-empty-interface
export interface SortColInfo extends MatSortable {
}

class SortColInfoImpl implements SortColInfo {
    /**
     * The id of the column being sorted.
     */
    public id!: string
    /**
     * Starting sort direction.
     */
    public start: Start = 'asc'
    /**
     * Whether to disable clearing the sorting state.
     */
    public disableClear = false
}

export class SortColInfoBuilder extends Builder<SortColInfo, SortColInfoImpl> {
    public constructor(obj?: Readonly<SortColInfo>) {
        const impl = new SortColInfoImpl()
        if (obj)
            SortColInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public id(id: string): this {
        this.getImpl().id = id
        return this
    }

    public start(start: Start): this {
        this.getImpl().start = start
        return this
    }

    public disableClear(disableClear: boolean): this {
        this.getImpl().disableClear = disableClear
        return this
    }

    protected get daa(): readonly string[] {
        return SortColInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['id']
}

export function isSortColInfo(value: unknown): value is SortColInfo {
    return value instanceof SortColInfoImpl
}

export function assertIsSortColInfo(
    value: unknown,
): asserts value is SortColInfo {
    if (!(value instanceof SortColInfoImpl))
        throw Error('Not a SortColInfo!')
}
