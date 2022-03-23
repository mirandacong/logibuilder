import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {postOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    Column,
    isBook,
    isColumn,
    isColumnBlock,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
    NodeType,
    Row,
    RowBlock,
    SliceExpr,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {SourceManager} from '@logi/src/lib/source'
import {safeDump} from 'js-yaml'

import {Model} from './base'

// tslint:disable-next-line: unknown-instead-of-any
type TextObj = any
type ToTextMap = Map<Readonly<Node>, TextObj>
const INDENT = 4
const NEW_LINE = '\n'
const START = '---'

export function toText(model: Readonly<Model>): string {
    const loadMap: ToTextMap = new Map()
    const walkData = new WalkDataBuilder()
        .sourceManager(model.sourceManager)
        .map(loadMap)
        .build()
    const node = model.book
    postOrderWalk2(node, loadVisitor, getSubnodes, walkData)
    const obj = loadMap.get(node)
    return getContent(safeDump(obj, {indent: INDENT}))
}

function getContent(str: string): string {
    return [START, str].join(NEW_LINE)
}

function getSubnodes(node: Readonly<Node>): readonly Readonly<Node>[] {
    const children: Readonly<Node>[] = []
    if (isBook(node))
        children.push(...node.sheets)
    else if (isSheet(node) || isTitle(node) || isRowBlock(node)
        || isColumnBlock(node))
        children.push(...node.tree)
    else if (isTable(node))
        children.push(...node.rows, ...node.cols)
    return children
}

// tslint:disable-next-line: max-func-body-length cyclomatic-complexity
function loadVisitor(
    node: Readonly<Node>,
    walkData: WalkData,
): readonly TextObj[] {
    // tslint:disable-next-line: no-object-literal-type-assertion
    const textObj = {} as TextObj
    const map = walkData.map
    switch (node.nodetype) {
    case NodeType.BOOK: {
        const labels = getLabels(node)
        const value = labels.length === 0 ? `${node.name}` :
            `${node.name}[${labels}]`
        textObj.Book = value
        setSubnodes(node, textObj, map)
        break
    }
    case NodeType.SHEET: {
        const labels = getLabels(node)
        const value = labels.length === 0 ? `${node.name}` :
            `${node.name}[${labels}]`
        textObj.Sheet = value
        setSubnodes(node, textObj, map)
        break
    }
    case NodeType.TITLE: {
        const labels = getLabels(node)
        const value = labels.length === 0 ? `${node.name}` :
            `${node.name}[${labels}]`
        textObj.Title = value
        setSubnodes(node, textObj, map)
        break
    }
    case NodeType.TABLE: {
        const n = node as Table
        textObj.header_stub = n.headerStub
        const labels = getLabels(n)
        const value = labels.length === 0 ? `${n.name}` :
            `${n.name}[${labels}]`
        textObj.Table = value
        const cols: TextObj[] = []
        const rows: TextObj[] = []
        getSubnodes(n).forEach((sub: Readonly<Node>): void => {
            const subString = map.get(sub)
            if (subString === undefined)
                return
            if (isRowBlock(sub) || isRow(sub))
                rows.push(subString)
            if (isColumnBlock(sub) || isColumn(sub))
                cols.push(subString)
        })
        textObj.rows = rows
        textObj.cols = cols
        break
    }
    case NodeType.COLUMN_BLOCK: {
        const labels = getLabels(node)
        const value = (labels.length === 0) ? `${node.name}` :
            `${node.name}[${labels}]`
        textObj.ColumnBlock = value
        setSubnodes(node, textObj, map)
        break
    }
    case NodeType.ROW_BLOCK: {
        const n = node as RowBlock
        const labels = getLabels(n)
        const value = labels.length === 0 ? `${n.name}` :
            `${n.name}[${labels}]`
        textObj.RowBlock = value
        setSubnodes(node, textObj, map)
        break
    }
    case NodeType.ROW: {
        const n = node as Row
        const labels = getLabels(node)
        const name = labels.length === 0 ? `${n.name}` :
            `${n.name}[${labels}]`
        Reflect.set(textObj, name, n.expression)
        setSources(n, textObj, walkData.sourceManager)
        const slices = n.sliceExprs.map(sliceToText)
        textObj.slice_exprs = slices
        break
    }
    case NodeType.COLUMN: {
        const n = node as Column
        const labels = getLabels(node)
        const name = labels.length === 0 ? `${n.name}` :
            `${n.name}[${labels}]`
        Reflect.set(textObj, name, n.expression)
        const slices = n.sliceExprs.map(sliceToText)
        textObj.slice_exprs = slices
        break
    }
    default:
    }
    map.set(node, textObj)
    return []
}

function getLabels(node: Readonly<Node>): readonly string[] {
    return node.labels
}

function setSubnodes(
    node: Readonly<Node>,
    textObj: TextObj,
    map: ToTextMap,
): void {
    const subs: TextObj[] = []
    getSubnodes(node).forEach((sub: Readonly<Node>): void => {
        const subString = map.get(sub)
        if (subString !== undefined)
            subs.push(subString)
    })
    textObj.subnodes = subs
}

function setSources(
    node: Readonly<Row>,
    textObj: TextObj,
    manager: SourceManager,
): void {
    const table = node.getTable()
    if (!isTable(table))
        return
    const cols = table.getLeafCols()
    const result: (number | string)[] = []
    let nullCount = 0
    cols.forEach((col: Readonly<Column>): void => {
        const source = manager.getSource(node.uuid, col.uuid)
        if (source !== undefined && source.value !== '') {
            result.push(source.value)
            return
        }
        result.push('null')
        nullCount += 1
    })
    if (nullCount === result.length)
        return
    textObj.sources = result
}

function sliceToText(slice: SliceExpr): TextObj {
    const slices = {}
    const name = slice.name
    const expression = slice.expression
    Reflect.set(slices, name, expression)
    return slices
}

interface WalkData {
    readonly map: ToTextMap
    readonly sourceManager: SourceManager
}

class WalkDataImpl implements Impl<WalkData> {
    public map!: ToTextMap
    public sourceManager!: SourceManager
}

export class WalkDataBuilder extends Builder<WalkData, WalkDataImpl> {
    public constructor(obj?: Readonly<WalkData>) {
        const impl = new WalkDataImpl()
        if (obj)
            WalkDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public map(map: ToTextMap): this {
        this.getImpl().map = map
        return this
    }

    public sourceManager(sourceManager: SourceManager): this {
        this.getImpl().sourceManager = sourceManager
        return this
    }

    protected get daa(): readonly string[] {
        return WalkDataBuilder.__DAA_PROPS__
    }
}

export function isWalkData(value: unknown): value is WalkData {
    return value instanceof WalkDataImpl
}

export function assertIsWalkData(value: unknown): asserts value is WalkData {
    if (!(value instanceof WalkDataImpl))
        throw Error('Not a WalkData!')
}
