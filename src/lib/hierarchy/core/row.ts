import {Impl} from '@logi/base/ts/common/mapped_types'

import {
    FormulaBearer,
    FormulaBearerImpl,
    FormularBearerBuilder,
} from './formula_bearer'
import {BookSubnode, Node, NodeType, TableSubnode} from './node'
import {Path, PathBuilder} from './path'

export const enum DataType {
    FLOW,
    NONE,
    SCALAR,
    STOCK,
}

export interface Row extends Node, BookSubnode, TableSubnode, FormulaBearer {
    /**
     * The row defined in dsl which start with `@`.
     */
    readonly isDefScalar: boolean
    readonly dataType: DataType
}

class RowImpl extends FormulaBearerImpl implements Impl<Row> {
    public isDefScalar = false

    public get nodetype(): NodeType {
        return RowImpl.__NODETYPE__
    }

    public getPath(): Path {
        const nodePath = super.getPath()
        return new PathBuilder(nodePath).alias(this.alias).build()
    }

    public get dataType(): DataType {
        if (this.isDefScalar)
            return DataType.SCALAR
        if (this.labels.length === 0 || this.labels.length > 1)
            return DataType.NONE
        if (this.labels[0] === '流量')
            return DataType.FLOW
        if (this.labels[0] === '存量')
            return DataType.STOCK
        return DataType.NONE
    }

    private static readonly __NODETYPE__: NodeType = NodeType.ROW
}

export class RowBuilder extends FormularBearerBuilder<Row, RowImpl> {
    public constructor(obj?: Readonly<Row>) {
        const impl = new RowImpl()
        if (obj)
            RowBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public isDefScalar(isDefScalar: boolean): this {
        this.getImpl().isDefScalar = isDefScalar

        return this
    }
}

export function isRow(node: unknown): node is Readonly<Row> {
    return node instanceof RowImpl
}

export function assertIsRow(node: unknown): asserts node is Readonly<Row> {
    if (!(node instanceof RowImpl))
        throw Error('Not a Row!.')
}
