import {
    FormulaBearer,
    FormulaBearerImpl,
    FormularBearerBuilder,
} from './formula_bearer'
import {BookSubnode, Node, NodeType, TableSubnode} from './node'

export interface Column
    extends Node, BookSubnode, TableSubnode, FormulaBearer {}

class ColumnImpl extends FormulaBearerImpl implements Column {
    public get nodetype(): NodeType {
        return ColumnImpl.__NODETYPE__
    }

    private static readonly __NODETYPE__: NodeType = NodeType.COLUMN
}

export class ColumnBuilder extends FormularBearerBuilder<Column, ColumnImpl> {
    public constructor(obj?: Readonly<Column>) {
        const impl = new ColumnImpl()
        if (obj)
            ColumnBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isColumn(node: unknown): node is Readonly<Column> {
    return node instanceof ColumnImpl
}

export function assertIsColumn(
    node: unknown,
): asserts node is Readonly<Column> {
    if (!(node instanceof ColumnImpl))
        throw Error('Not a column!.')
}
