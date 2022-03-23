import {Builder} from '@logi/base/ts/common/builder'
import {Exception, isException} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {postOrderWalk} from '@logi/base/ts/common/walk_utils'
import {Op} from '@logi/src/lib/compute/op'
import {Column, Row} from '@logi/src/lib/hierarchy/core'

export const enum Type {
    OPERATOR,
    CONSTANT,
    REFERENCE,
}

export type ValidateRule = (operator: Node) => Exception | void

/**
 * A node of est (Expression Syntax Tree).
 */
export abstract class Node {
    public get parent(): Readonly<Node> | undefined {
        return this._parent
    }
    public constructor(children: readonly Readonly<Node>[]) {
        children.forEach((child: Readonly<Node>): void => {
            const node = child as Node
            node._parent = this
        })
    }
    public readonly children: readonly Readonly<Node>[] = []
    public abstract readonly type: Type

    /**
     * Each formulaInfo correspond to an `Op` and `InNodes` as well as the head
     * in header.
     */
    public getFormulaInfo(): readonly FormulaInfo[] {
        const map = new Map<Node, readonly FormulaInfo[]>()
        postOrderWalk(this, this._visit, getSubnodes, map)
        const info = map.get(this)
        if (info)
            return info
        return []
    }

    public validate(): Exception | void {
        for (const rule of this.validateRules) {
            const result = rule(this)
            if (isException(result))
                return result
        }
    }

    protected abstract readonly validateRules: readonly ValidateRule[]

    /**
     * Call this method to collect subFormulaInfo list from subnodes when walk
     * on a node.
     */
    protected abstract collectFormulaInfo(walkInfo: WalkInfo):
        readonly SubFormulaInfo[]

    /**
     * Build formulaInfo from collecting subFormulaInfo list.
     */
    protected abstract buildFormulaInfo(
        subs: readonly SubFormulaInfo[]): readonly FormulaInfo[]
    private _parent?: Readonly<Node>

    private _buildFormulaInfo(walkInfo: WalkInfo): readonly FormulaInfo[] {
        const subFormulaInfo = this.collectFormulaInfo(walkInfo)
        return this.buildFormulaInfo(subFormulaInfo)
    }

    // tslint:disable-next-line: prefer-function-over-method
    private _visit(opNode: Node, walkInfo: WalkInfo): readonly string[] {
        const newHead2Ops = opNode._buildFormulaInfo(walkInfo)
        walkInfo.set(opNode, newHead2Ops)
        return []
    }
}

export function isEst(node: unknown): node is Readonly<Node> {
    return node instanceof Node
}

export function assertIsEst(node: unknown): asserts node is Readonly<Node> {
    if (!(node instanceof Node))
        throw Error('Not a est!.')
}

function getSubnodes(opNode: Node): readonly Node[] {
    return opNode.children as Node[]
}

export type WalkInfo = Map<Readonly<Node> | undefined, readonly FormulaInfo[]>

/**
 * Each OpAndInNodes is a 2-tuple [op, ref_list], use [Row, Column] to represent
 * each ref.
 *
 * The op of a OpAndInNodes is the corresponding Op object for the expression.
 *
 * The ref_list is a list of [Row, Column] recording the row and column list
 * referenced by this expression.
 *
 * The OpAndInNodes type is very similar to SubOpInfo (used to define
 * CompositeOp), but retains all lexical information.
 */
export type OpAndInNodes = readonly [Op | undefined, readonly CellCoordinate[]]
export type Head = Readonly<Row> | Readonly<Column>
export type CellCoordinate = readonly [Readonly<Row>, Readonly<Column>]
export type Headless = 0
export const HEADLESS: Headless = 0

/**
 * The name of this class maybe confused, this structure is concluded by the
 * information passed during postorder walk of `est`.
 */
export interface FormulaInfo {
    /**
     * One of the header of the est.
     *
     * In the following cases the head is headless
     *      - OpInfo is `ConstantOpInfo`.
     *      - OpInfo is `Operator` which type is `type2` or `type4`.
     *      - OpInfo is other type and there is no intersection among the
     *        subnodes of the opInfo.
     */
    readonly head: Head | Headless

    readonly op: Readonly<Op> | undefined

    readonly inNodes: readonly CellCoordinate[]
}

class FormulaInfoImpl implements Impl<FormulaInfo> {
    public head!: Head | Headless
    public op!: Readonly<Op> | undefined
    public inNodes!: readonly CellCoordinate[]
}

export class FormulaInfoBuilder extends Builder<FormulaInfo, FormulaInfoImpl> {
    protected get daa(): readonly string[] {
        return FormulaInfoBuilder.__DAA_PROPS__
    }
    public constructor(obj?: Readonly<FormulaInfo>) {
        const impl = new FormulaInfoImpl()
        if (obj)
            FormulaInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public head(value: Head | Headless): this {
        this.getImpl().head = value
        return this
    }

    // tslint:disable-next-line: no-optional-parameter
    public op(value?: Readonly<Op>): this {
        this.getImpl().op = value
        return this
    }

    public inNodes(value: readonly CellCoordinate[]): this {
        this.getImpl().inNodes = value
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'head',
        'inNodes',
        'op',
    ]
}

/**
 * A support interface for collecting the infos from children.
 * A head maps to multiple opAndInNodes which are from children.
 */
export interface SubFormulaInfo {
    readonly head: Head | Headless
    readonly opAndInNodes: readonly OpAndInNodes[]
}

export class SubFormulaInfoBuilder extends
    Builder<SubFormulaInfo, SubFormulaInfoImpl> {
    public constructor(obj?: Readonly<SubFormulaInfo>) {
        const impl = new SubFormulaInfoImpl()
        if (obj)
            SubFormulaInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public head(value: Head | Headless): this {
        this.getImpl().head = value
        return this
    }

    public opAndInNodes(value: readonly OpAndInNodes[]): this {
        this.getImpl().opAndInNodes = value
        return this
    }

    protected get daa(): readonly string[] {
        return SubFormulaInfoBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'head',
        'opAndInNodes',
    ]
}

class SubFormulaInfoImpl implements SubFormulaInfo {
    public head!: Head | Headless
    public opAndInNodes!: readonly OpAndInNodes[]
}
