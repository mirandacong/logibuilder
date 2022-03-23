import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Op} from '@logi/src/lib/compute/op'
import {Type} from '@logi/src/lib/hierarchy/core'

// row_uuid, col_uuid
export type CellCoordinateId = readonly [string, string]

export interface CellExpr {
    readonly op: Readonly<Op>
    readonly inNodes: readonly CellCoordinateId[]
    readonly priority: number
    readonly type: Type
    readonly castFrom: CastFrom
}

class CellExprImpl implements Impl<CellExpr> {
    public op!: Readonly<Op>
    public inNodes: readonly CellCoordinateId[] = []
    public priority = 0
    public type = Type.FX
    public castFrom!: CastFrom
}

export class CellExprBuilder extends Builder<CellExpr, CellExprImpl> {
    public constructor(obj?: Readonly<CellExpr>) {
        const impl = new CellExprImpl()
        if (obj)
            CellExprBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public op(op: Readonly<Op>): this {
        this.getImpl().op = op
        return this
    }

    public inNodes(inNodes: readonly CellCoordinateId[]): this {
        this.getImpl().inNodes = inNodes
        return this
    }

    public priority(priority: number): this {
        this.getImpl().priority = priority
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    public castFrom(castFrom: CastFrom): this {
        this.getImpl().castFrom = castFrom
        return this
    }

    protected get daa(): readonly string[] {
        return CellExprBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'op',
        'castFrom',
    ]
}

export function isCellExpr(value: unknown): value is CellExpr {
    return value instanceof CellExprImpl
}

export function assertIsCellExpr(value: unknown): asserts value is CellExpr {
    if (!(value instanceof CellExprImpl))
        throw Error('Not a CellExpr!')
}

export interface CastFrom {
    // The uuid of the fb.
    readonly formulaBearer: string
    readonly sliceName?: string
}

class CastFromImpl implements Impl<CastFrom> {
    public formulaBearer!: string
    public sliceName?: string
}

export class CastFromBuilder extends Builder<CastFrom, CastFromImpl> {
    public constructor(obj?: Readonly<CastFrom>) {
        const impl = new CastFromImpl()
        if (obj)
            CastFromBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public formulaBearer(formulaBearer: string): this {
        this.getImpl().formulaBearer = formulaBearer
        return this
    }

    public sliceName(sliceName?: string): this {
        this.getImpl().sliceName = sliceName
        return this
    }

    protected get daa(): readonly string[] {
        return CastFromBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['formulaBearer']
}

export function isCastFrom(value: unknown): value is CastFrom {
    return value instanceof CastFromImpl
}

export function assertIsCastFrom(value: unknown): asserts value is CastFrom {
    if (!(value instanceof CastFromImpl))
        throw Error('Not a CastFrom!')
}
