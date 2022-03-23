import {Builder} from '@logi/base/ts/common/builder'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {Op, OpType, SubOpInfo} from '@logi/src/lib/compute/op'
import {CellCoordinateId, CellExpr} from '@logi/src/lib/dsl/semantic/cells'
import {
    assertIsFormulaBearer,
    Book,
    Column,
    FormulaBearer,
    getNodesVisitor,
    NodeType,
    Row,
    SliceExpr,
    Table,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {safeDump} from 'js-yaml'

import {ExprManager} from '../expr_manager'

class CellInfo {
    public constructor(pos: Pos, formulaList: readonly CellFormulaInfo[]) {
        this.pos = pos
        this.formulaList = formulaList
    }
    public pos: Pos
    public formulaList: readonly CellFormulaInfo[] = []
}

interface CellFormulaInfo {
    readonly expr: string
    readonly op?: WrappedOp
    readonly inNodes: readonly Pos[]
    readonly priority: number
    readonly type: string
    readonly castFrom: string
}

class CellFormulaInfoImpl implements CellFormulaInfo {
    public expr!: string
    public op?: WrappedOp
    public inNodes: readonly Pos[] = []
    public priority!: number
    public type!: string
    public castFrom!: string
}

class CellFormulaInfoBuilder extends
    Builder<CellFormulaInfo, CellFormulaInfoImpl> {
    public constructor(obj?: Readonly<CellFormulaInfo>) {
        const impl = new CellFormulaInfoImpl()
        if (obj)
            CellFormulaInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public expr(expr: string): this {
        this.getImpl().expr = expr
        return this
    }

    public op(op?: WrappedOp): this {
        this.getImpl().op = op
        return this
    }

    public inNodes(inNodes: readonly Pos[]): this {
        this.getImpl().inNodes = inNodes
        return this
    }

    public priority(priority: number): this {
        this.getImpl().priority = priority
        return this
    }

    public type(type: string): this {
        this.getImpl().type = type
        return this
    }

    public castFrom(castFrom: string): this {
        this.getImpl().castFrom = castFrom
        return this
    }

    protected get daa(): readonly string[] {
        return CellFormulaInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['expr', 'inNodes', 'priority', 'type', 'castFrom']
}

export function isCellFormulaInfo(value: unknown): value is CellFormulaInfo {
    return value instanceof CellFormulaInfoImpl
}

export function assertIsCellFormulaInfo(
    value: unknown,
): asserts value is CellFormulaInfo {
    if (!(value instanceof CellFormulaInfoImpl))
        throw Error('Not a CellFormulaInfo!')
}

class Pos {
    public constructor(row: string, col: string) {
        this.row = row
        this.col = col
    }
    public row: string
    public col: string
}

class InNodes {
    // tslint:disable-next-line: readonly-keyword no-indexable-types
    [key: string]: readonly string[]
}

/**
 * Because of low speed of test due to the large size, we only dump the cell
 * exprs who are not empty.
 */
// tslint:disable-next-line: max-func-body-length
export function getTestStr(
    book: Readonly<Book>,
    exprManager: ExprManager,
): string {
    // tslint:disable-next-line: no-type-assertion
    const fbs = preOrderWalk(
        book,
        getNodesVisitor,
        [NodeType.ROW, NodeType.COLUMN],
    ) as FormulaBearer[]
    const cellInfos: CellInfo[] = []
    const fbInNodes: InNodes = {}
    fbs.forEach((fb: FormulaBearer): void => {
        const inNodeIds = exprManager.depsStorage.getDeps(fb.uuid)
        const key = fb.getPath().toString()
        // tslint:disable-next-line: no-type-assertion
        fbInNodes[key] = inNodeIds.map((
            id: string,
        ): string => findFb(fbs, id).getPath().toString())
    })

    // tslint:disable-next-line: no-type-assertion
    const tables = preOrderWalk(
        book,
        getNodesVisitor,
        [NodeType.TABLE],
    ) as Table[]
    // tslint:disable-next-line: max-func-body-length
    tables.forEach((t: Table): void => {
        const rows = t.getLeafRows()
        const cols = t.getLeafCols()
        rows.forEach((r: Readonly<Row>): void => {
            // tslint:disable-next-line: max-func-body-length
            cols.forEach((c: Readonly<Column>): void => {
                const rowPath = r.getPath().toString()
                const colPath = c.getPath().toString()
                const pos = new Pos(rowPath, colPath)
                const cells = exprManager
                    .cellStorage
                    .getCellExprs(r.uuid, c.uuid)
                    .filter((ce: CellExpr): boolean => ce.op.name !== 'empty')
                const cellFormulaInfoList = cells.map((
                    cellExpr: CellExpr,
                ): CellFormulaInfo => {
                    let expr: string
                    const castFromFb = findFb(
                        fbs,
                        cellExpr.castFrom.formulaBearer,
                    )
                    if (cellExpr.castFrom.sliceName !== undefined) {
                    // tslint:disable-next-line: no-type-assertion
                        const slice = castFromFb.sliceExprs.find((
                            s: Readonly<SliceExpr>,
                        ): boolean => s.name === cellExpr.castFrom.sliceName,
                    ) as SliceExpr
                        expr = slice?.expression
                    } else
                        expr = castFromFb.expression
                    const castFrom = `${castFromFb
                        .getPath()
                        .toString()}-${cellExpr.castFrom.sliceName || ''}`
                    const inNodes = cellExpr.inNodes.map((
                        coordinate: CellCoordinateId,
                    ): Pos => {
                        const c0 = findFb(fbs, coordinate[0])
                        const c1 = findFb(fbs, coordinate[1])
                        return new Pos(c0
                            .getPath()
                            .toString(), c1.getPath().toString())
                    })
                    const wrappedOp = cellExpr.op === undefined
                        ? undefined : convertOp(cellExpr.op)
                    return new CellFormulaInfoBuilder()
                        .castFrom(castFrom)
                        .expr(expr)
                        .inNodes(inNodes)
                        .op(wrappedOp)
                        .priority(cellExpr.priority)
                        .type(Type[cellExpr.type])
                        .build()
                })
                if (cellFormulaInfoList.length > 0)
                    cellInfos.push(new CellInfo(pos, cellFormulaInfoList))
            })
        })
    })
    return getContent(safeDump({cellInfos, fbInNodes}, {sortKeys: true}))
}

function findFb(fbs: readonly FormulaBearer[], fbId: string): FormulaBearer {
    const fb = fbs.find((n: FormulaBearer): boolean => n.uuid === fbId)
    assertIsFormulaBearer(fb)
    return fb
}

function getContent(str: string): string {
    const newLine = '\n'
    const start = '---'
    return [start, str].join(newLine)
}

/**
 * Internal CompositeOp interface only use to get fileds of the composite op.
 */
interface CompositeOp extends Op {
    readonly rootOp: Op
    readonly subOpInfos: readonly SubOpInfo[]
}

/**
 * Internal ConstantOp interface only use to get fileds of the composite op.
 */
interface ConstantOp extends Op {
    readonly value: number
}

interface WrappedOp {
    readonly type: string
}
type WrappedSubOpInfo = readonly [WrappedOp, readonly number[]] | number

// tslint:disable-next-line: max-classes-per-file
class WrappedCompositeOp implements WrappedOp {
    public constructor(
        rootOp: string,
        subOpInfos: readonly WrappedSubOpInfo[],
    ) {
        this.rootOp = rootOp
        this.subOpInfos = subOpInfos
    }
    public type = 'Composite'
    public rootOp: string
    public subOpInfos: readonly WrappedSubOpInfo[] = []
}

// tslint:disable-next-line: max-classes-per-file
class WrappedAtomicOp implements WrappedOp {
    public constructor(image: string) {
        this.image = image
    }
    public type = 'Atomic'
    public image: string
}

// tslint:disable-next-line: max-classes-per-file
class WarppedConstantOp implements WrappedOp {
    public constructor(value: number) {
        this.value = value
    }
    public type = 'Atomic'
    public value: number
}

function convertOp(op: Op): WrappedOp {
    switch (op.optype) {
    case OpType.ATOMIC:
        return new WrappedAtomicOp(op.name)
    case OpType.CONSTANT:
        // tslint:disable-next-line: no-type-assertion
        return new WarppedConstantOp((op as ConstantOp).value)
    case OpType.COMPOSITE:
        // tslint:disable-next-line: no-type-assertion
        const compositeOp = op as CompositeOp
        const image = compositeOp.rootOp.name
        const infos: WrappedSubOpInfo[] = []
        compositeOp.subOpInfos.forEach((info: SubOpInfo): void => {
            if (typeof info === 'number') {
                infos.push(info)

                return
            }
            infos.push([convertOp(info[0]), info[1]])
        })

        return new WrappedCompositeOp(image, infos)
    default:
        // tslint:disable-next-line: no-throw-unless-asserts
        throw Error('Unsupported op type.')
    }
}
