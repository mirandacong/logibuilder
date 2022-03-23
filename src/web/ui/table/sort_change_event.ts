import {Sort} from '@angular/material/sort'
import {Builder} from '@logi/base/ts/common/builder'
export interface SortChangeEvent {
    readonly sort: Sort
    equals(sortChangeEvent: SortChangeEvent): boolean
}

class SortChangeEventImpl implements SortChangeEvent {
    public sort!: Sort
    public equals(sortChangeEvent: SortChangeEvent): boolean {
        return this.sort.active === sortChangeEvent.sort.active
            && this.sort.direction === sortChangeEvent.sort.direction
    }
}

export class SortChangeEventBuilder
extends Builder<SortChangeEvent, SortChangeEventImpl> {
    public constructor(obj?: Readonly<SortChangeEvent>) {
        const impl = new SortChangeEventImpl()
        if (obj)
            SortChangeEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sort(sort: Sort): this {
        this.getImpl().sort = sort
        return this
    }

    protected get daa(): readonly string[] {
        return SortChangeEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sort',
    ]
}

export function isSortChangeEvent(value: unknown): value is SortChangeEvent {
    return value instanceof SortChangeEventImpl
}

export function assertIsSortChangeEvent(
    value: unknown,
): asserts value is SortChangeEvent {
    if (!(value instanceof SortChangeEventImpl))
        throw Error('Not a SortChangeEvent!')
}
