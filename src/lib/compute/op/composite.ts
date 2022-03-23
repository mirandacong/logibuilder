// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {Builder} from './base'
import {Op, OpType} from './node'

interface CompositeOp extends Op {
    readonly rootOp: Op
    readonly subOpInfos: readonly Readonly<SubOpInfo>[]
}

export class CompositeOpBuilder extends Builder<CompositeOp, CompositeOpImpl> {
    public constructor(obj?: Readonly<CompositeOp>) {
        const impl = new CompositeOpImpl()
        if (obj)
            CompositeOpBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    protected get daa(): readonly string[] {
        return [...Builder.__DAA_PROPS__, 'rootOp', 'subOpInfos']
    }

    //
    // Properties that CompositeOpBuilder adds on top of OpBuilder.
    //
    public rootOp(rootOp: Readonly<Op>): this {
        this._getImpl().rootOp = rootOp

        return this
    }

    public subOpInfos(subOpInfos: readonly Readonly<SubOpInfo>[]): this {
        this._getImpl().subOpInfos = subOpInfos

        return this
    }
}

/**
 * @see CompositeOpImpl.subOpInfos
 */
export type SubOpInfo = readonly [Op, readonly number[]] | number

/**
 * Safe to use definite assignmnet assertions because the builder class,
 * CompositeOpBuilder verifies that they are defined.
 */
class CompositeOpImpl implements CompositeOp {
    public get optype(): OpType {
        return CompositeOpImpl.__OPTYPE__
    }

    public name!: string
    public inTypes!: readonly t.Mixed[]
    public outType!: t.Mixed

    /**
     * The root operator, whose value IS the output value of this CompositeOp.
     *
     * See the documentation of subOpInfo for more information.
     */
    public rootOp!: Op

    /**
     * The immediate child nodes, or subOps for short, of rootOp.
     * See op.proto for more information.
     */
    public subOpInfos!: readonly Readonly<SubOpInfo>[]

    /**
     * NOTE: The root op of this CompositeOp MUST be an AtomicOp.
     */
    public excelFormula(...args: readonly string[]): string {
        /**
         * It is safe to use type assertion below because it will be verified
         * in `CompositeOpBuilder.postVerifyHook()`.
         */
        const rootFormula: string[] = []
        /**
         * It is safe to use type assertion below because it will be verified
         * in `CompositeOpBuilder.postVerifyHook()`.
         */
        this.subOpInfos.forEach((subOpInfo: SubOpInfo, idx: number): void => {
            if (typeof subOpInfo === 'number') {
                rootFormula.push(`${args[subOpInfo]}`)
                return
            }
            const op = subOpInfo[0]
            const subOpArgs = subOpInfo[1].map((v: number): string => args[v])
            let sub = op.excelFormula(...subOpArgs)
            if (shouldAddBracket(this.rootOp, op, idx))
                sub = `(${sub})`
            rootFormula.push(sub)
        })

        return this.rootOp.excelFormula(...rootFormula)
    }

    /**
     * Evaluate this operator against given input.
     *
     * 1.   Get root op args.
     *      If typeof subOpInfo is `number`  => Get the `subOpInfo`-th of
     *                                          args as the root op args.
     *      else                             => Evaluate the subOpInfo as the
     *                                          root op args.
     * 2.   Evaluate the root op with rootArgs.
     */
    public evaluate(...args: readonly unknown[]): unknown {
        const rootArgs: unknown[] = []
        /**
         * It is safe to use type assertion below because it will be verified
         * in `CompositeOpBuilder.postVerifyHook()`.
         */
        this.subOpInfos.forEach((subOpInfo: SubOpInfo): void => {
            if (typeof subOpInfo === 'number') {
                rootArgs.push(args[subOpInfo])
                return
            }
            const op = subOpInfo[0]
            const subOpArgs = subOpInfo[1].map((v: number): unknown => args[v])
            rootArgs.push(op.evaluate(...subOpArgs))
        })

        /**
         * It is safe to use type assertion below because it will be verified
         * in `CompositeOpBuilder.postVerifyHook()`.
         */
        return this.rootOp.evaluate(...rootArgs)
    }
    private static readonly __OPTYPE__: OpType = OpType.COMPOSITE
}

/**
 * If the root op level is higher than the sub op, add bracket.
 * If the root op level is lower than the sub op, don't add bracket.
 * If the root op level equals to the sub op:
 *      If the root op has left associativity and the sub is not the first one,
 *          add bracket.
 *      If the root op has righst associativity and the sub is the first one,
 *          add bracket.
 *      Otherwise, don't add bracket.
 */
function shouldAddBracket(root: Op, sub: Op, idx: number): boolean {
    const rootLevel = getLevel(root.name)
    if (rootLevel === LEVEL_NONE)
        return false
    const subLevel = getSubOpLevel(sub)
    if (subLevel === LEVEL_NONE)
        return false
    if (rootLevel > subLevel)
        return true
    if (rootLevel < subLevel)
        return false
    if (LEFT_ASSOCIATIVITY.has(root.name) && idx !== 0)
        return true
    if (RIGHT_ASSOCIATIVITY.has(root.name) && idx === 0)
        return true
    return false
}

/**
 * If op is not composite type, get the level according to the name.
 * If op is composite type:
 *      1) The rootOp is not `id`, get the level according to the name of the
 *  rootOp.
 *      2) The rootOp is `id`, get the level of sub first node by recursion.
 */
function getSubOpLevel(op: Op): number {
    if (op.optype === OpType.CONSTANT)
        return LEVEL_NONE
    if (!(op instanceof CompositeOpImpl))
        return getLevel(op.name)
    if (op.rootOp.name !== 'id')
        return getLevel(op.rootOp.name)
    if (op.subOpInfos[0] === undefined || typeof op.subOpInfos[0] === 'number')
        return LEVEL_NONE
    const sub = op.subOpInfos[0][0]
    return getSubOpLevel(sub)
}

/**
 * The LEVEL_NONE means no level, and needn't compare with other level.
 */
const LEVEL_NONE = 0

const LEVEL_TO_OP = new Map([
    [LEVEL_NONE, ['if', 'average', 'count', 'id', 'empty', 'max', 'min', 'power',
        'log', 'sin', 'cos', 'scalar', 'rank', 'round', 'sum', 'irr', 'xirr',
        'npv', 'xnpv', 'iferror', 'switch', 'date', 'to', 'and', 'or', 'not',
        'iserror', 'yearfrac']],
    [1, ['lt', 'gt', 'le', 'ge', 'eq', 'ne', 'concat']],
    // tslint:disable: no-magic-numbers
    [2, ['add', 'sub']],
    [3, ['mul', 'div', 'muls']],
    [4, ['negative', 'positive']],
])

function getLevelMap(): Map<string, number> {
    const map = new Map<string, number>()
    LEVEL_TO_OP.forEach((names: string[], level: number): void => {
        names.forEach((n: string): void => {
            map.set(n, level)
        })
    })
    return map
}

const LEVEL_MAP = getLevelMap()

function getLevel(name: string): number {
    const level = LEVEL_MAP.get(name)
    if (level === undefined)
        // tslint:disable-next-line: no-throw-unless-asserts
        throw new Error(`Unknown atomic op '${name}'. Add it to level map.`)
    return level
}

const LEFT_ASSOCIATIVITY = new Set<string>([
    'add',
    'sub',
    'mul',
    'muls',
    'div',
    'lt',
    'gt',
    'le',
    'ge',
    'eq',
    'ne',
    'concat',
])

const RIGHT_ASSOCIATIVITY = new Set<string>([])

/**
 *
 * @description
 * OpDef is define an minimum operator in computation graph. There are two
 * types of OpDef, Composite Operator and Atomic Operator.
 *
 * In the follow example, The box corner of Composite Operator is '$', Atomic
 * Operator is '%', The minimum unit which consist of a Atomic Operator is using
 * '+' with the corner of the box.
 *
 * @fileoverview
 *
 * @param
 * expression:  The formula of this operator, Such as `f(g(s(x),y),h(y),3)`.
 * root:        If this operator is a composite operator, The structure of this
 *              operator is a tree, This attribute is root of the
 *              tree. In the follow example, The root of `f'` is `f`.
 *              If atomic operator, This attribute is undefine.
 * children:    If the operator is atomic operator, There is no children,
 *              If composite operator, It has children which is a list of
 *              atomic operator or composite operator.
 * vars:        The parameter list of the operator, So far it only record the
 *              index of parameters. In this example, The vars of `f'` is
 *              [0,1,2], The vars of `s` is [0].
 * var2var:     The correspondence of vars with children vars, For example,
 *              The first var of composite operator `f'` is corresponding
 *              to the first var of its first child `g'`, The second var of `f'`
 *              is corresponding to the second var of its first child `g'` and
 *              the first var of its second child `h`, The second var of `f'`
 *              is corresponding to the first var of its third child `identity`.
 *
 * $---------------------------------------------------------------------------$
 * |f'     %-----------------------------------------------------------------% |
 * |       | f                               +------+                        | |
 * |       |       +------------------------>|retval|<-------------+         | |
 * |       |       |                         +--+---+              |         | |
 * |       |       |                            |                  |         | |
 * |       |    +------+                     +------+           +------+     | |
 * |       |    |f_var0|                     |f_var1|           |f_var2|     | |
 * |       |    +------+                     +------+           +------+     | |
 * |       |       ^                            ^                  ^         | |
 * |       %-------|----------------------------|------------------|---------% |
 * |               |                            |                  |           |
 * | $-------------|-----------------$  %-------|--------%  %------|--------%  |
 * | | g'          |                 |  | h     |        |  |identity       |  |
 * | |          +------+             |  |    +------+    |  |   +------+    |  |
 * | |       +->|retval|<--+         |  |    |retval|    |  |   |retval|    |  |
 * | |       |  +------+   |         |  |    +------+    |  |   +------+    |  |
 * | |       |             |         |  |       |        |  |      |        |  |
 * | |    +------+      +------+     |  |    +------+    |  |   +------+    |  |
 * | |    |g_var0|      |g_var1|     |  |    |h_var0|    |  |   |i_var0|    |  |
 * | |    +------+      +------+     |  |    +------+    |  |   +------+    |  |
 * | |       ^              ^        |  |       ^        |  |      ^        |  |
 * | | %-----|------% %-----|------% |  %-------|--------%  %------|--------%  |
 * | | |s +------+  | |  +------+  | |          |                  |           |
 * | | |  |retval|  | |  |retval|  | |          |                  |           |
 * | | |  +--+---+  | |  +--+---+  | |          |                  |           |
 * | | |     |      | |     |      | |          |                  |           |
 * | | |  +------+  | |  +------+  | |          |                  |           |
 * | | |  |s_var0|  | |  |i_var0|  | |          |                  |           |
 * | | |  +------+  | |  +------+  | |          |                  |           |
 * | | |     ^      | |     ^      | |          |                  |           |
 * | | %-----|------% %-----|------% |          |                  |           |
 * | |    +-------+     +-------+    |          |                  |           |
 * | |    |g'_var0|     |g'_var1|    |          |                  |           |
 * | |    +-------+     +-------+    |          |                  |           |
 * | |       ^              ^        |          |                  |           |
 * | $-------|--------------|--------$          |                  |           |
 * |         |              |                   |                  |           |
 * |      +-------+         |                +-------+          +--┴----+      |
 * |      |f'_var0|         +----------------|f'_var1|          |f'_var2|      |
 * |      +-------+                          +-------+          +-------+      |
 * |                                                                           |
 * $---------------------------------------------------------------------------$
 *
 *
 *
 *
 * ┌──────────┬──────────┐
 * │ headgin1 │ heading2 │
 * ├──────────┼──────────┤
 * │ a        │ b        │
 * └──────────┴──────────┘
 *
 *
 */
