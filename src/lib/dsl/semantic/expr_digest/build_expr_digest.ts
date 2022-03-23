import {assertIsDefined} from '@logi/base/ts/common/assert'
import {isException} from '@logi/base/ts/common/exception'
import {Op, OP_REGISTRY} from '@logi/src/lib/compute/op'
import {
    EMPTY_TOKEN,
    Error,
    ErrorType,
    isError,
    lex,
    lexSuccess,
    Token,
} from '@logi/src/lib/dsl/lexer/v2'
import {
    CastFromBuilder,
    Cell,
    CellBuilder,
    CellExpr,
    CellExprBuilder,
} from '@logi/src/lib/dsl/semantic/cells'
import {
    ExprError,
    ExprErrorBuilder,
    ExprErrorType,
} from '@logi/src/lib/dsl/semantic/errors'
import {
    assertIsEst,
    buildEst,
    BuildInfoBuilder,
    buildOperator,
    CellCoordinate,
    equals,
    FormulaInfo,
    Head,
    HEADLESS,
    Headless,
    isEst,
    isOperator,
    isReference,
    Node as Est,
    Reference,
} from '@logi/src/lib/dsl/semantic/est'
import {
    applyColumnFilter,
    applyRowFilter,
} from '@logi/src/lib/dsl/semantic/filter'
import {
    FormulaBearer,
    isRow,
    isTable,
    resolve,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'

import {ExprDigest, ExprDigestBuilder} from './base'

type ExprNode = FormulaBearer | SliceExpr

// tslint:disable-next-line: cyclomatic-complexity max-func-body-length
export function buildExprDigest(
    formulaBearer: Readonly<FormulaBearer>,
    slice?: SliceExpr,
    oldEst?: Readonly<Est>,
): ExprDigest | readonly ExprError[] {
    const digestBuilder = new ExprDigestBuilder()
    // tslint:disable-next-line: no-nested-ternary
    const est = oldEst !== undefined
        ? oldEst
        : slice === undefined ? getEst(formulaBearer) : getEst(slice)
    if (!isEst(est))
        return est
    const validateRes = validateEst(est)
    if (validateRes.length > 0)
        return validateRes
    digestBuilder.est(est)
    const nodes = getAndSetReferenceNodes(est, formulaBearer)
    const fbInNodes = nodes.map((n: Readonly<FormulaBearer>): string => n.uuid)
    digestBuilder.fbInNodes(fbInNodes)
    const fbInfos = est.getFormulaInfo()
    const cells: Cell[] = []
    const opInfoHeader = fbInfos.map((c: FormulaInfo): Head | Headless =>
        c.head)
    if (opInfoHeader[0] === undefined)
        return digestBuilder.cells(cells).build()
    const table = formulaBearer.getTable()
    if (!isTable(table))
        return digestBuilder.build()
    // The fb is row and isDefScalar.
    if (isRow(formulaBearer) && formulaBearer.isDefScalar) {
        const fbInfo = fbInfos[0]
        const cellExpr = buildCellExpr(fbInfo, formulaBearer, slice)
        const leafCols = table.getLeafCols()
        if (leafCols.length === 0)
            return digestBuilder.cells(cells).build()
        cells.push(new CellBuilder()
            .cellExpr(cellExpr)
            .column(leafCols[0].uuid)
            .row(formulaBearer.uuid)
            .build())
        return digestBuilder.cells(cells).build()
    }

    // The fb the not a defScalar
    const header = slice === undefined ? table
        .getFbHeader(formulaBearer) : getSliceHeader(formulaBearer, slice)

    const isHeadless = fbInfos[0]?.head === HEADLESS
    header.forEach((h: Head): void => {
        let fbInfo = fbInfos.find((v: FormulaInfo): boolean => {
            if (v.head === HEADLESS)
                return false
            return equals(v.head, h)
        })
        if (isHeadless)
            fbInfo = fbInfos[0]
        const cellExpr = fbInfo !== undefined
            ? buildCellExpr(fbInfo, formulaBearer, slice)
            : buildEmptyCellExpr(formulaBearer, slice)
        if (isRow(formulaBearer)) {
            cells.push(new CellBuilder()
                .cellExpr(cellExpr)
                .column(h.uuid)
                .row(formulaBearer.uuid)
                .build())
            return
        }
        cells.push(new CellBuilder()
            .cellExpr(cellExpr)
            .column(formulaBearer.uuid)
            .row(h.uuid)
            .build())
    })

    return digestBuilder.cells(cells).build()
}

function validateEst(root: Readonly<Est>): readonly ExprError[] {
    const errors: ExprError[] = []
    const validate = root.validate()
    if (validate !== undefined)
        errors.push(new ExprErrorBuilder()
            .message(validate.message)
            .type(ExprErrorType.FUNCTION)
            .build())
    if (!isOperator(root))
        return errors
    root.children.forEach((c: Readonly<Est>): void => {
        const subErrs = validateEst(c)
        errors.push(...subErrs)
    })
    return errors
}

function getPriority(
    fb: Readonly<FormulaBearer>,
    slice?: Readonly<SliceExpr>,
): number {
    const colHasExpr = 4
    const rowHasExpr = 3
    const rowEmptyExpr = 2
    const colEmptyExpr = 1
    if (slice === undefined) {
        if (isRow(fb))
            return fb.expression === '' ? rowEmptyExpr : rowHasExpr
        return fb.expression === '' ? colEmptyExpr : colHasExpr
    }
    if (isRow(fb))
        return slice.expression === '' ? rowEmptyExpr : rowHasExpr
    return slice.expression === '' ? colEmptyExpr : colHasExpr
}

function buildCellExpr(
    fbInfo: FormulaInfo,
    fb: Readonly<FormulaBearer>,
    slice?: SliceExpr,
): Readonly<CellExpr> {
    const castFrom = new CastFromBuilder()
        .formulaBearer(fb.uuid)
        .sliceName(slice?.name)
        .build()
    const inNodes: [string, string][] = fbInfo.inNodes.map(
        (cellCoordinate: CellCoordinate): [string, string] =>
        [cellCoordinate[0].uuid, cellCoordinate[1].uuid],
    )
    const defaultName = 'id'
    const defaultOp = OP_REGISTRY.get(defaultName)
    assertIsDefined<Op>(defaultOp)
    const priority = getPriority(fb, slice)
    const type = slice === undefined ? fb.type : slice.type
    return new CellExprBuilder()
        .castFrom(castFrom)
        .inNodes(inNodes)
        .op(fbInfo.op ?? defaultOp)
        .priority(priority)
        .type(type)
        .build()
}

function getEst(exprNode: ExprNode): Readonly<Est> | readonly ExprError[] {
    if (exprNode.expression.trim() === '') {
        const estInfo = new BuildInfoBuilder()
            .image('empty')
            .children([])
            .token(EMPTY_TOKEN)
            .build()
        return buildOperator(estInfo)
    }
    const toks = lex(exprNode.expression)
    if (!lexSuccess(toks))
        return getLexError(toks)
    const result = buildEst(toks)
    if (!isException(result))
        return result
    return [new ExprErrorBuilder()
        .type(ExprErrorType.GRAMMAR)
        .message(result.message)
        .build()]
}

function getLexError(toks: readonly (Token | Error)[]): readonly ExprError[] {
    const errors: ExprError[] = []
    let unrecog = ''
    toks.forEach((t: Token | Error): void => {
        if (isError(t) && t.type === ErrorType.UNRECORGNIZED) {
            unrecog += t.image
            return
        }
        if (unrecog !== '') {
            errors.push(new ExprErrorBuilder()
                .type(ExprErrorType.GRAMMAR)
                .message(`无法识别 ${unrecog}，请检查语法`)
                .build())
            unrecog = ''
        }
        if (!isError(t))
            return
        switch (t.type) {
        case (ErrorType.EXPECTED):
            errors.push(new ExprErrorBuilder()
                .type(ExprErrorType.GRAMMAR)
                .message(`缺少${t.image}`)
                .build())
            break
        case (ErrorType.UNEXPECTED_END):
            errors.push(new ExprErrorBuilder()
                .type(ExprErrorType.GRAMMAR)
                .message('表达式不合法')
                .build())
            break
        default:
        }
    })
    if (unrecog !== '')
        errors.push(new ExprErrorBuilder()
            .type(ExprErrorType.GRAMMAR)
            .message(`无法识别 ${unrecog}，请检查语法`)
            .build())
    return errors
}

/**
 * Get the reference nodes from the given expr and the current node.
 * We can use the default namespace from current node when there is no
 * namespace in ref of expr.
 * For example, the expr is `{a} + {b}`, this function will return the
 * hierarchy nodes which reference by `a` and `b`.
 */
// tslint:disable-next-line:max-func-body-length
function getAndSetReferenceNodes(
    opNode: Readonly<Est>,
    curr: Readonly<FormulaBearer>,
): readonly Readonly<FormulaBearer>[] {
    const refList: Reference[] = []
    const stack: Readonly<Est>[] = [opNode]
    while (stack.length > 0) {
        const n = stack.pop()
        assertIsEst(n)
        if (isReference(n))
            refList.push(n)
        stack.push(...n.children)
    }
    /**
     * Map ref csts to hierarchy nodes.
     *
     * Get ref nodes from `RefExprCstList`
     *      1. Resolve path
     *          If the result is undefined
     *              If the node is root node, push book path into
     *                  `ENVIRONMENT.undefinedReferences`
     *              If not, push path into `ENVIRONMENT.undefinedReferences`.
     *          If not, get the hierarchy node.
     */
    const refNodes: Readonly<FormulaBearer>[] = []
    for (let i = refList.length - 1; i >= 0; i -= 1) {
        const ref = refList[i]
        ref.hierarchyNode = undefined
        const fbs = resolve(ref.path, curr)
        /**
         * Take the first node in resolvedNodes.
         */
        if (fbs.length === 0)
            continue
        const refNode = fbs[0]
        refNodes.push(refNode)
        ref.hierarchyNode = refNode
    }
    return Array.from(new Set(refNodes).values())
}

function getSliceHeader(
    fb: Readonly<FormulaBearer>,
    slice: Readonly<SliceExpr>,
): readonly Head[] {
    const table = fb.getTable()
    if (!isTable(table))
        return []
    if (isRow(fb)) {
        const cols = applyColumnFilter(table.getLeafCols(), slice.name)
        if (isException(cols))
            return []
        return cols
    }
    const rows = applyRowFilter(table.getLeafRows(), slice.name)
    if (isException(rows))
        return []
    return rows
}

function buildEmptyCellExpr(
    fb: Readonly<FormulaBearer>,
    slice?: SliceExpr,
): CellExpr {
    const defaultName = 'empty'
    // tslint:disable-next-line: no-type-assertion
    const op = OP_REGISTRY.get(defaultName) as Op
    const cf = new CastFromBuilder()
        .formulaBearer(fb.uuid)
        .sliceName(slice?.name)
        .build()
    const type = slice === undefined ? fb.type : slice.type
    const prority = getPriority(fb, slice)
    return new CellExprBuilder()
        .priority(prority)
        .op(op)
        .castFrom(cf)
        .type(type)
        .build()
}
