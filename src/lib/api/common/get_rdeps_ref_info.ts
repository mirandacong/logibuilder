import {Builder} from '@logi/base/ts/common/builder'
import {isException} from '@logi/base/ts/common/exception'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {lex, lexSuccess, Token, TokenType} from '@logi/src/lib/dsl/lexer/v2'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {
    FB_TYPES,
    FormulaBearer,
    getNodesVisitor,
    isBook,
    isFormulaBearer,
    isSliceExpr,
    Node,
    NodeType,
    Part,
    PathBuilder,
    resolve,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'

import {RefInfo, RefInfoBuilder} from './ref_info'

export function getRdepsRefInfo(
    target: Readonly<Node>,
    exprManager: ExprManager,
    nodesMap: Map<string, Readonly<Node>>,
): readonly Readonly<RefInfo>[] {
    const rdepsInfos: Readonly<RefInfo>[] = []
    const rdeps = getRdeps(target, exprManager, nodesMap)
    rdeps.forEach((rdep: Readonly<Rdep>): void => {
        const positions = getRefPositions(rdep, target)
        if (positions.length === 0)
            return
        const rdepsInfo = new RefInfoBuilder().node(rdep.fb).ranges(positions)
        if (rdep.slice !== undefined)
            rdepsInfo.slice(rdep.slice)
        rdepsInfos.push(rdepsInfo.build())
    })
    return rdepsInfos
}

// tslint:disable-next-line: max-func-body-length
function getRefPositions(
    rdep: Readonly<Rdep>,
    target: Readonly<Node>,
): readonly (readonly [number, number])[] {
    const positions: [number, number][] = []
    const expression = rdep.slice !== undefined ? rdep.slice.expression :
        rdep.fb.expression
    const toks = lex(expression)
    if (!lexSuccess(toks))
        return []
    let len = 0
    toks.forEach((tok: Token): void => {
        if (tok.type !== TokenType.REF) {
            len += tok.image.length
            return
        }
        const ref = tok.image.substring(1, tok.image.length - 1)
        const path = PathBuilder.buildFromString(ref)
        if (isException(path))
            return
        const nodes = resolve(path, rdep.fb)
        if (nodes.length !== 1)
            return
        let curr: Readonly<Node> | null
        curr = nodes[0]
        // tslint:disable-next-line: ext-variable-name naming-convention
        path.parts.forEach((_: Part, i: number): void => {
            const index = path.parts.length - 1 - i
            const part = path.parts[index]
            if (part.name === '' || curr === null)
                return
            const currPath = curr.getPath().toString()
            const tarPath = target.getPath().toString()
            if (currPath !== tarPath || target.nodetype !== curr.nodetype) {
                curr = curr.parent
                return
            }
            curr = curr.parent
            // Check if there is a splitter.
            const splitter = index === 0 ? 0 : 1
            const start = path.parts
                .slice(0, index)
                .map(p => p.toString())
                .join('!').length + len + 1 + splitter // Plus 1 for the '{'
            const end = start + part.toString().length - 1
            positions.push([start, end])
        })
        len += tok.image.length
    })
    return positions
}

/**
 * export only for test.
 */
export function getRdeps(
    node: Readonly<Node>,
    exprManager: ExprManager,
    map: Map<string, Readonly<Node>>,
): readonly Readonly<Rdep>[] {
    const rdeps: Readonly<Rdep>[] = []
    const book = node.findParent(NodeType.BOOK)
    if (!isBook(book))
        return []
    const fbs = preOrderWalk(book, getNodesVisitor, FB_TYPES)
        .filter(isFormulaBearer)
    fbs.forEach((fb: Readonly<FormulaBearer>): void => {
        fb.sliceExprs.forEach((slice: Readonly<SliceExpr>): void => {
            exprManager
                .depsStorage
                .getDeps(fb.uuid, slice.name)
                .map(uuid => map.get(uuid))
                .filter(isFormulaBearer)
                .forEach((n: Readonly<FormulaBearer>): void => {
                    const parent = n.findParent(node.nodetype)
                    if (parent !== node)
                        return
                    if (includes(rdeps, slice))
                        return
                    rdeps.push(new RdepBuilder().slice(slice).fb(fb).build())
                })
        })
        if (fb.sliceExprs.length !== 0)
            return
        exprManager
            .depsStorage
            .getDeps(fb.uuid)
            .map(uuid => map.get(uuid))
            .filter(isFormulaBearer)
            .forEach((n: Readonly<FormulaBearer>): void => {
                const parent = n.findParent(node.nodetype)
                if (parent !== node)
                    return
                if (includes(rdeps, fb))
                    return
                rdeps.push(new RdepBuilder().fb(fb).build())
            })
    })
    return rdeps
}

function includes(
    rdeps: readonly Readonly<Rdep>[],
    node: Readonly<FormulaBearer | SliceExpr>,
): boolean {
    for (const rdep of rdeps) {
        if (isSliceExpr(node) && rdep.slice === node)
            return true
        if (rdep.slice === undefined && rdep.fb === node)
            return true
    }
    return false
}

/**
 * export only for test.
 */
export interface Rdep {
    /**
     * If rdep is a fb, this field is the fb.
     * If rdep is a slice, this field is the fb which contains the slice.
     */
    readonly fb: Readonly<FormulaBearer>
    /**
     * If rdep is a fb, this field is undefined.
     * If rdep is a slice, this field is the slice.
     */
    readonly slice?: Readonly<SliceExpr>
}

class RdepImpl implements Rdep {
    public fb!: Readonly<FormulaBearer>
    public slice?: Readonly<SliceExpr>
}

class RdepBuilder extends Builder<Rdep, RdepImpl> {
    public constructor(obj?: Readonly<Rdep>) {
        const impl = new RdepImpl()
        if (obj)
            RdepBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public fb(fb: Readonly<FormulaBearer>): this {
        this.getImpl().fb = fb
        return this
    }

    public slice(slice: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
        return this
    }

    protected get daa(): readonly string[] {
        return RdepBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['fb']
}

export function isRdep(obj: unknown): obj is Rdep {
    return obj instanceof RdepImpl
}
