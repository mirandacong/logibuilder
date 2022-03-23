/* eslint-disable max-lines */
import {Exception, isException} from '@logi/base/ts/common/exception'
import {Writable} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {getRdepsRefInfo, RefInfo} from '@logi/src/lib/api/common'
import {
    DepRange,
    HierarchyPayload,
    Payload,
    SetExpressionPayloadBuilder,
    SetFormulaPayloadBuilder,
    SetModifierPayloadBuilder,
    SetSliceExprPayloadBuilder,
    SetSourcePayloadBuilder,
    UpdateDepExprPayloadBuilder,
    UpdateRdepExprPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {Error, isError, lex, Token , TokenType} from '@logi/src/lib/dsl/lexer/v2'
import {
    ColumnBlock,
    DateRange,
    FormulaBearer,
    getNodesVisitor,
    getSubnodes,
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isNode,
    isRow,
    isRowBlock,
    isTable,
    Label,
    Node,
    NodeType,
    PathBuilder,
    resolve,
    SCALAR_HEADER,
    SliceExpr,
    Table,
    toDateRange,
} from '@logi/src/lib/hierarchy/core'
import {CloneResult} from '@logi/src/lib/model'
import {buildStdHeader, TemplateSet} from '@logi/src/lib/template'

export function getChildIndex(child: Readonly<Node>): number {
    const parent = child.parent
    if (!isNode(parent))
        return -1
    if (!isTable(parent))
        return getSubnodes(parent).indexOf(child)
    if (isRow(child) || isRowBlock(child))
        return parent.rows.indexOf(child)
    if (isColumn(child) || isColumnBlock(child))
        return parent.cols.indexOf(child)
    return -1
}

export function getExprPayloads(
    refInfos: readonly Readonly<RefInfo>[],
    newName: string,
): readonly Readonly<HierarchyPayload>[] {
    const payloads: Readonly<HierarchyPayload>[] = []
    refInfos.forEach((info: Readonly<RefInfo>): void => {
        let length = 0
        const node = info.slice ?? info.node
        let expression = node.expression
        info.ranges.forEach((range: readonly [number, number]): void => {
            const start = range[0] + length
            const end = range[1] + length
            const newLength = newName.length
            const oldLength = range[1] - range[0] + 1
            length += newLength - oldLength
            const startStr = expression.slice(0, start)
            const endStr = expression.slice((end + 1))
            expression = startStr + newName + endStr
        })
        if (isFormulaBearer(node))
            payloads.push(new SetExpressionPayloadBuilder()
                .uuid(node.uuid)
                .expression(expression)
                .build())
        else
            payloads.push(new SetSliceExprPayloadBuilder()
                .expression(expression)
                .index(info.node.sliceExprs.indexOf(node))
                .uuid(info.node.uuid)
                .build())
    })
    return payloads
}

export function getPayloadsFromCloneResult<T extends Node>(
    res: CloneResult<T>,
): readonly Payload[] {
    const payloads: Payload[] = []
    res.modifiers.forEach(m => payloads.push(new SetModifierPayloadBuilder()
        .row(m.uuid)
        .modifier(m)
        .build()))
    res.sourceItems.forEach(d => payloads.push(new SetSourcePayloadBuilder()
        .row(d.row)
        .col(d.col)
        .source(d.source)
        .build()))
    res.formulaItems.forEach(d => payloads.push(new SetFormulaPayloadBuilder()
        .row(d.row)
        .col(d.col)
        .formula(d.formula)
        .build()))
    return payloads
}

export function updateTmplTableHeader(
    root: Readonly<Node>,
    stdHeaderSet: TemplateSet,
): void {
    const tables = preOrderWalk(root, getNodesVisitor, [NodeType.TABLE])
        .filter(isTable)
    const allowed = ['默认表头', '历史期', '预测期']
    tables.forEach((t: Readonly<Table>): void => {
        // tslint:disable-next-line: no-type-assertion
        const w = t as Writable<Table>
        if (t.referenceHeader === SCALAR_HEADER)
            return
        const header = stdHeaderSet.standardHeaders
            .find(h => h.name === t.referenceHeader)
        if (!allowed.includes(t.referenceHeader ?? '') ||
            header === undefined) {
            w.referenceHeader = undefined
            return
        }
        const newCols = buildStdHeader(header.reportDate, header.headerInfos)
        updateHeaderUuidAndLabels(w, newCols)
        const oldCols = w.cols
        oldCols.forEach(c => w.deleteSubnode(c))
        newCols.tree.slice().forEach(c => w.insertSubnode(c))
    })
}

export function updateHeaderUuidAndLabels(
    table: Readonly<Table>,
    newCols: Readonly<ColumnBlock>,
): void {
    /**
     * Name to uuid.
     */
    const uuidMap = new Map<string, string>()
    /**
     * TODO(zecheng): The standard labels should get from a common place.
     */
    const stdLabels = [
        '历史期', '预测期',
        '当期', '当期_半年度', '当期_季度',
        '预测期开始', '预测期开始_半年度', '预测期开始_季度',
        '预测期结束', '预测期结束_半年度', '预测期结束_季度',
    ]
    const labelMap = new Map<string, Label[]>()
    const oldCols = preOrderWalk(
        table,
        getNodesVisitor,
        [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
    )
    oldCols.forEach((n: Readonly<Node>): void => {
        const name = removeSuffixE(n.name)
        uuidMap.set(name, n.uuid)
        const customLabels = n.labels.filter((l: string): boolean =>
            !stdLabels.includes(l))
        labelMap.set(name, customLabels)
    })
    const newNodes = preOrderWalk(
        newCols,
        getNodesVisitor,
        [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
    )
    newNodes.forEach((n: Readonly<Node>): void => {
        const name = removeSuffixE(n.name)
        const oldUuid = uuidMap.get(name)
        if (oldUuid !== undefined) {
            // tslint:disable-next-line: no-type-assertion
            const writable = n as Writable<Node>
            writable.uuid = oldUuid
        }

        const customLabels = labelMap.get(name)
        if (customLabels === undefined)
            return
        // tslint:disable-next-line: no-type-assertion
        const labels = n.labels as Label[]
        labels.push(...customLabels)
    })
}

function removeSuffixE(year: string): string {
    return year.endsWith('E') ? year.slice(0, year.length - 1) : year
}

export function renameReferenceNode(
    node: Readonly<Node>,
    newName: string,
    service: EditorService,
): readonly Readonly<HierarchyPayload>[] {
    const result: Readonly<HierarchyPayload>[] = []
    const infos = getRdepsRefInfo(node, service.exprManager, service.bookMap)
    result.push(...getExprPayloads(infos, newName))
    return result
}

export function getUpdateRdepExprPayload(
    node: Readonly<Node>,
    service: EditorService,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const exprManager = service.exprManager
    const uuids = exprManager.depsStorage.getRdeps(node.uuid)
    const nodesMap = service.bookMap
    const rdeps = uuids.map(id => nodesMap.get(id)).filter(isFormulaBearer)
    rdeps.forEach((fb: Readonly<FormulaBearer>): void => {
        fb.sliceExprs.forEach((slice: Readonly<SliceExpr>): void => {
            const sliceRanges = getRanges(node, fb, slice.expression)
            if (sliceRanges.length === 0)
                return
            payloads.push(new UpdateRdepExprPayloadBuilder()
                .uuid(fb.uuid)
                .dep(node.uuid)
                .ranges(sliceRanges)
                .slice(slice.uuid)
                .build())
        })
        if (fb.sliceExprs.length !== 0)
            return
        const ranges = getRanges(node, fb, fb.expression)
        if (ranges.length === 0)
            return
        payloads.push(new UpdateRdepExprPayloadBuilder()
            .uuid(fb.uuid)
            .dep(node.uuid)
            .ranges(ranges)
            .build())
    })
    return payloads
}

function getRanges(
    node: Readonly<Node>,
    curr: Readonly<Node>,
    expr: string,
): readonly DepRange[] {
    const ranges: DepRange[] = []
    const toks = lex(expr)
    let length = 0
    toks.forEach((t: Token | Error): void => {
        length += t.image.length
        if (isError(t) || t.type !== TokenType.REF)
            return
        const path = PathBuilder
            .buildFromString(t.image.slice(1, t.image.length - 1))
        if (isException(path))
            return
        const result = resolve(path, curr)
        if (result[0] !== node)
            return
        ranges.push(new DepRange(length - t.image.length, length))
    })
    return ranges
}

export function getUpdateDepExprPayload(
    node: Readonly<Node>,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    if (!isFormulaBearer(node))
        return []
    const map = getDepMap(node, node.expression)
    if (map.length !== 0)
        payloads.push(new UpdateDepExprPayloadBuilder()
            .uuid(node.uuid)
            .depMap(map)
            .build())
    node.sliceExprs.forEach((s: SliceExpr): void => {
        const sliceMap = getDepMap(node, s.expression)
        if (sliceMap.length === 0)
            return
        payloads.push(new UpdateDepExprPayloadBuilder()
            .uuid(node.uuid)
            .slice(s.uuid)
            .depMap(sliceMap)
            .build())
    })
    return payloads
}

function getDepMap(
    curr: Readonly<Node>,
    expr: string,
): readonly (readonly [string, DepRange])[] {
    const map: [string, DepRange][] = []
    const toks = lex(expr)
    let length = 0
    toks.forEach((t: Token | Error): void => {
        length += t.image.length
        if (isError(t) || t.type !== TokenType.REF)
            return
        const path = PathBuilder
            .buildFromString(t.image.slice(1, t.image.length - 1))
        if (isException(path))
            return
        const result = resolve(path, curr)
        if (result[0] === undefined)
            return
        map.push([
            result[0].uuid,
            new DepRange(length - t.image.length, length),
        ])
    })
    return map
}

export function getRowLevel(row: Readonly<Node>): number {
    let p: Readonly<Node> | null = row
    let level = 0
    while (p !== null && p.nodetype === NodeType.ROW_BLOCK) {
        level += 1
        p = p.parent
    }
    return level
}

export function getStartEndDate(
    table: Readonly<Table>,
): readonly [string, string] {
    const ranges = table.getLeafCols().map(toDateRange)
    let start: number | undefined
    let end: number | undefined
    ranges.forEach((r: DateRange | Exception): void => {
        if (isException(r))
            return
        if (start === undefined)
            start = r.start.year
        if (end === undefined)
            end = r.start.year
        if (start !== undefined && r.start.year < start)
            start = r.start.year
        if (end !== undefined && r.end.year > end)
            end = r.end.year
    })
    const startDate = start === undefined ? '' : `${start}-01-01`
    const endDate = end === undefined ? '' : `${end + 1}-01-01`
    return [startDate, endDate]
}

export function updateRdepAlias(
    node: Readonly<Node>,
    newAlias: string,
    service: EditorService,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    const rdeps = service.exprManager.depsStorage.getRdeps(node.uuid)
    const fbs: Readonly<FormulaBearer>[] = []
    const bookMap = service.bookMap
    rdeps.forEach((uuid: string): void => {
        const fb = bookMap.get(uuid)
        if (isFormulaBearer(fb))
            fbs.push(fb)
    })
    fbs.forEach((fb: Readonly<FormulaBearer>): void => {
        const newExpr = getNewExpr(fb.expression, fb, newAlias, node)
        if (newExpr !== fb.expression)
            payloads.push(new SetExpressionPayloadBuilder()
                .uuid(fb.uuid)
                .expression(newExpr)
                .build())
        fb.sliceExprs.forEach((s: SliceExpr, idx: number): void => {
            const newSliceExpr = getNewExpr(s.expression, fb, newAlias, node)
            if (newSliceExpr === s.expression)
                return
            payloads.push(new SetSliceExprPayloadBuilder()
                .uuid(fb.uuid)
                .index(idx)
                .expression(newExpr)
                .build())
        })
    })
    return payloads
}

function getNewExpr(
    // tslint:disable-next-line: max-params
    expr: string,
    node: Readonly<Node>,
    newAlias: string,
    target: Readonly<Node>,
): string {
    let newExpr = ''
    const tokens = lex(expr)
    tokens.forEach((t: Token | Error): void => {
        if (isError(t) || t.type !== TokenType.REF) {
            newExpr += t.image
            return
        }
        const path = PathBuilder
            .buildFromString(t.image.slice(1, t.image.length - 1))
        if (isException(path)) {
            newExpr += t.image
            return
        }
        const result = resolve(path, node)
        if (result[0] !== target) {
            newExpr += t.image
            return
        }
        const newPath = new PathBuilder(path).alias(newAlias).build()
        const newRef = `{${newPath.toString()}}`
        newExpr += newRef
    })
    return newExpr
}
// tslint:disable-next-line: max-file-line-count
