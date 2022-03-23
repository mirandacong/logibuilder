import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {SliceExpr} from '@logi/src/lib/hierarchy/core'

import {Result} from '../base'

export interface FocusResult extends Result {
    readonly actionType: number
    readonly hierarchy: readonly HierarhcyFocus[]
    readonly source: readonly SourceFocus[]
}

class FocusResultImpl implements Impl<FocusResult> {
    public actionType!: number
    public hierarchy: readonly HierarhcyFocus[] = []
    public source: readonly SourceFocus[] = []
}

export class FocusResultBuilder extends Builder<FocusResult, FocusResultImpl> {
    public constructor(obj?: Readonly<FocusResult>) {
        const impl = new FocusResultImpl()
        if (obj)
            FocusResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public hierarchy(hierarchy: readonly HierarhcyFocus[]): this {
        this.getImpl().hierarchy = hierarchy
        return this
    }

    public source(source: readonly SourceFocus[]): this {
        this.getImpl().source = source
        return this
    }

    protected get daa(): readonly string[] {
        return FocusResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['actionType']
}

export function isFocusResult(value: unknown): value is FocusResult {
    return value instanceof FocusResultImpl
}

export function assertIsFocusResult(
    value: unknown,
): asserts value is FocusResult {
    if (!(value instanceof FocusResultImpl))
        throw Error('Not a FocusResult!')
}

export interface HierarhcyFocus {
    readonly uuid: string
    readonly slice?: Readonly<SliceExpr>
}

class HierarhcyFocusImpl implements Impl<HierarhcyFocus> {
    public uuid!: string
    public slice?: Readonly<SliceExpr>
}

export class HierarhcyFocusBuilder extends
    Builder<HierarhcyFocus, HierarhcyFocusImpl> {
    public constructor(obj?: Readonly<HierarhcyFocus>) {
        const impl = new HierarhcyFocusImpl()
        if (obj)
            HierarhcyFocusBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public slice(slice: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
        return this
    }

    protected get daa(): readonly string[] {
        return HierarhcyFocusBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['uuid']
}

export function isHierarhcyFocus(value: unknown): value is HierarhcyFocus {
    return value instanceof HierarhcyFocusImpl
}

export function assertIsHierarhcyFocus(
    value: unknown,
): asserts value is HierarhcyFocus {
    if (!(value instanceof HierarhcyFocusImpl))
        throw Error('Not a HierarhcyFocus!')
}

export interface SourceFocus {
    readonly row: string
    readonly col: string
}

class SourceFocusImpl implements Impl<SourceFocus> {
    public row!: string
    public col!: string
}

// tslint:disable-next-line: max-classes-per-file
export class SourceFocusBuilder extends Builder<SourceFocus, SourceFocusImpl> {
    public constructor(obj?: Readonly<SourceFocus>) {
        const impl = new SourceFocusImpl()
        if (obj)
            SourceFocusBuilder.shallowCopy(impl, obj)
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

    protected get daa(): readonly string[] {
        return SourceFocusBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
    ]
}

export function isSourceFocus(value: unknown): value is SourceFocus {
    return value instanceof SourceFocusImpl
}

export function assertIsSourceFocus(
    value: unknown,
): asserts value is SourceFocus {
    if (!(value instanceof SourceFocusImpl))
        throw Error('Not a SourceFocus!')
}
