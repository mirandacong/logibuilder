import {ConstantOpBuilder, OP_REGISTRY} from '@logi/src/lib/compute/op'
import {
    Column,
    FormulaBearer,
    isColumn,
    isRow,
    Path,
    Row,
    Table,
} from '@logi/src/lib/hierarchy/core'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    CellCoordinate,
    FormulaInfo,
    FormulaInfoBuilder,
    Head,
    HEADLESS,
    Node,
    SubFormulaInfo,
    Type,
} from './node'

export class Reference extends Node {
    public constructor(public readonly path: Path) {
        super([])
    }

    public hierarchyNode?: Readonly<FormulaBearer>
    public readonly type = Type.REFERENCE
    public children: readonly Readonly<Node>[] = []
    protected validateRules: readonly never[] = []

    // tslint:disable-next-line: max-func-body-length
    protected buildFormulaInfo(): readonly FormulaInfo[] {
        if (this.hierarchyNode === undefined)
            return []
        // tslint:disable-next-line: no-type-assertion
        const table = this.hierarchyNode.getTable() as Readonly<Table>
        const header = table.getFbHeader(this.hierarchyNode)
        const result: FormulaInfo[] = []
        const refOpName = 'id'
        /**
         * If this node has no parent, it means the expression is like this:
         * `{a} = {b}`. In this situation, we should wrap this reference into
         * an op.
         */
        const op = this.parent ? undefined : OP_REGISTRY.get(refOpName)
        const node = this.hierarchyNode
        if (isRow(node) && !node.isDefScalar) {
            const row = node
            header.forEach((head: Head): void => {
                const cell: readonly CellCoordinate[] = [
                    /**
                     * Safe to use type assertion below, because if the node is
                     * row, the header of this node should be an array of
                     * column.
                     */
                    // tslint:disable-next-line: no-type-assertion
                    [row, head as Readonly<Column>]]
                const info = new FormulaInfoBuilder()
                    .head(head)
                    .op(op)
                    .inNodes(cell)
                    .build()
                result.push(info)
            })
        } else if (isRow(node) && node.isDefScalar)
            if (header.length === 0) {
                const constantOp = new ConstantOpBuilder()
                    .inTypes([t.number])
                    .outType(t.number)
                    .value(0)
                    .build()
                result.push(new FormulaInfoBuilder()
                    .head(HEADLESS)
                    .op(constantOp)
                    .inNodes([])
                    .build())
            } else {
                const cells: readonly CellCoordinate[] = [
                    // tslint:disable-next-line: no-type-assertion
                    [node, header[0] as Readonly<Column>]]
                result.push(new FormulaInfoBuilder()
                    .head(HEADLESS)
                    .op(op)
                    .inNodes(cells)
                    .build())
            }
        else if (isColumn(node)) {
            const col = node
            header.forEach((head: Head): void => {
                const cell: readonly CellCoordinate[] = [
                    // tslint:disable-next-line: no-type-assertion
                    [head as Readonly<Row>, col]]
                const info = new FormulaInfoBuilder()
                    .head(head)
                    .op(op)
                    .inNodes(cell)
                    .build()
                result.push(info)
            })
        }
        return result
    }

    /**
     * Reference opinfo is always a leaf node and only internal node is supposed
     * to use this function.
     */
    // tslint:disable-next-line: prefer-function-over-method
    protected collectFormulaInfo(): readonly SubFormulaInfo[] {
        return []
    }
}

export function isReference(obj: unknown): obj is Reference {
    return obj instanceof Reference
}
