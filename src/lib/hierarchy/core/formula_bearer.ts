import {Impl} from '@logi/base/ts/common/mapped_types'

import {Node, NodeBuilder, NodeType} from './node'
import {SliceExpr, Type} from './slice_expr'

export const FB_TYPES: readonly NodeType[] = [
    NodeType.COLUMN,
    NodeType.ROW,
]

export interface FormulaBearer extends Node {
    readonly expression: string
    readonly sliceExprs: readonly Readonly<SliceExpr>[]
    readonly type: Type
    readonly alias: string
    readonly valid: boolean
    readonly separator: boolean
    getTable(): Readonly<Node> | undefined
    getBook(): Readonly<Node> | undefined
}

export abstract class FormulaBearerImpl extends Node implements FormulaBearer {
    public expression = ''
    public type = Type.FX
    public sliceExprs: readonly Readonly<SliceExpr>[] = []
    public alias = ''
    public valid = true
    public separator = false

    public getTable(): Readonly<Node> | undefined {
        return this.findParent(NodeType.TABLE)
    }

    public getBook(): Readonly<Node> | undefined {
        return this.findParent(NodeType.BOOK)
    }
}

export class FormularBearerBuilder<T extends FormulaBearer, S extends Impl<T>>
    extends NodeBuilder<T, S> {
    public expression(expression: string): this {
        this.getImpl().expression = expression
        return this
    }

    public sliceExprs(slices: readonly Readonly<SliceExpr>[]): this {
        this.getImpl().sliceExprs = slices
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    public alias(alias: string): this {
        this.getImpl().alias = alias.trim()
        return this
    }

    public valid(valid: boolean): this {
        this.getImpl().valid = valid
        return this
    }

    public separator(separator: boolean): this {
        this.getImpl().separator = separator
        return this
    }

    protected preBuildHook(): void {
        super.preBuildHook()
        if (this.getImpl().separator)
            this.getImpl().valid = false
    }
}

export function isFormulaBearer(
    node: unknown,
): node is Readonly<FormulaBearer> {
    return node instanceof FormulaBearerImpl
}

export function assertIsFormulaBearer(
    node: unknown,
): asserts node is Readonly<FormulaBearer> {
    if (!(node instanceof FormulaBearerImpl))
        throw Error('Not a FormulaBearer!')
}
