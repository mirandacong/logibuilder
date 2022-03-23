import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'
import {Writable} from '@logi/base/ts/common/mapped_types'
import {correctParent} from '@logi/src/lib/api/common'
import {
    isHierarchyPayload,
    isModifierPayload,
    isRedoPayload,
    isSetFormulaPayload,
    isSheetPayload,
    isSourcePayload,
    isStdHeaderPayload,
    isUndoPayload,
    Payload,
} from '@logi/src/lib/api/payloads'
import {
    BookBuilder,

    ColumnBlockBuilder,
    ColumnBuilder,

    isBook,
    isColumn,
    isColumnBlock,

    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,

    RowBlockBuilder,
    RowBuilder,
    SheetBuilder,

    TableBuilder,
    TitleBuilder,
    UnsafeNode,
} from '@logi/src/lib/hierarchy/core'

import {Replacement} from './replacement'

/**
 * Shallow copy a hierarchy node. But notice that the array properties like
 * `subnodes` should be an other new array containing the references in the
 * original array.
 *
 * Notice that the parent of a subnode in the new node still points to the old
 * node.
 */
// tslint:disable-next-line: max-func-body-length
export function shallowCopy(node: Readonly<Node>): Readonly<Node> {
    if (isColumn(node))
        return new ColumnBuilder(node)
            .sliceExprs(node.sliceExprs.slice(0))
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
    if (isColumnBlock(node)) {
        const r = new ColumnBlockBuilder(node)
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
        // tslint:disable-next-line: no-type-assertion
        const writable = r.asUnsafe() as Writable<UnsafeNode>
        writable.subnodes = [...writable.subnodes]
        return r
    }
    if (isRow(node))
        return new RowBuilder(node)
            .sliceExprs(node.sliceExprs.slice(0))
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
    if (isTitle(node)) {
        const r = new TitleBuilder(node)
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
        // tslint:disable-next-line: no-type-assertion
        const writable = r.asUnsafe() as Writable<UnsafeNode>
        writable.subnodes = [...writable.subnodes]
        return r
    }
    if (isSheet(node)) {
        const r = new SheetBuilder(node)
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
        // tslint:disable-next-line: no-type-assertion
        const writable = r.asUnsafe() as Writable<UnsafeNode>
        writable.subnodes = [...writable.subnodes]
        return r
    }
    if (isTable(node)) {
        // tslint:disable-next-line: no-type-assertion
        const r = new TableBuilder(node)
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
        // tslint:disable-next-line: no-type-assertion
        const unsafe = r.asUnsafe() as Writable<UnsafeNode>
        unsafe.subnodes = [...node.asUnsafe().subnodes]
        return r
    }
    if (isBook(node)) {
        const r = new BookBuilder(node)
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
        // tslint:disable-next-line: no-type-assertion
        const writable = r.asUnsafe() as Writable<UnsafeNode>
        writable.subnodes = [...writable.subnodes]
        return r
    }
    if (isRowBlock(node)) {
        const r = new RowBlockBuilder(node)
            .labels(node.labels.slice(0))
            .annotations(new Map(node.annotations))
            .build()
        // tslint:disable-next-line: no-type-assertion
        const writable = r.asUnsafe() as Writable<UnsafeNode>
        writable.subnodes = [...writable.subnodes]
        return r
    }
    return node
}

/**
 * Get the new root of the hierarchy tree after serveral replacements happened.
 *
 * For example, in the hierarchy tree below, D should be replaced with D':
 *
 *     A               A             A            A'
 *   B   C           B   C         B'  C        B'  C
 *  D E   F        D' E   F       D' E  F      D' E   F
 *            P1              P2            P3
 * P1: Replace the D with D'.
 * P2: Shallow copy B and get B', replace the subnode D of B' with D'.
 * P3: Shallow copy A and get A', replace the subnode B of A' with B'.
 * And then A' is what we want.
 *
 * When taking multiple replacements of a tree into account, we used the
 * following rules:
 * - The replacements in the upper node should be applied first.
 * - Use a map to recording the changes on a hierarchy node.
 */
export function updateRoot(
    patches: readonly Replacement[],
): Readonly<Node> | Exception {
    for (const patch of patches) {
        const err = patch.validate()
        if (err !== undefined)
            return err
    }
    const newPatches = [...patches]
    newPatches.sort((a: Replacement, b: Replacement): number =>
        getNodeHeight(a.original) - getNodeHeight(b.original),
    )
    const link = new Map<string, Readonly<Node>>()
    let result: Readonly<Node> | undefined
    newPatches.forEach((p: Replacement): void => {
        let original = link.get(p.original.uuid) ?? p.original
        let substitute = p.substitute
        link.set(p.original.uuid, p.substitute)
        correctParent(p.substitute)
        // tslint:disable-next-line: no-type-assertion
        let parent = p.original.parent as (Readonly<Node> | null)
        if (parent === null) {
            result = substitute
            return
        }
        while (parent !== null) {
            const oriParent = link.get(parent.uuid) ?? parent
            const copyParent = shallowCopy(oriParent)
            copyParent.replaceSubnode(original, substitute)
            link.set(parent.uuid, copyParent)
            original = oriParent
            substitute = copyParent
            // tslint:disable-next-line: no-type-assertion
            parent = parent.parent as (Readonly<Node> | null)
            if (parent === null) {
                result = copyParent
                return
            }
        }
    })
    if (result === undefined)
        return new ExceptionBuilder().message('Get root error').build()
    correctParent(result)
    return result
}

function getNodeHeight(n: Readonly<Node>): number {
    let height = 0
    let parent = n.parent
    while (parent !== null) {
        parent = parent.parent
        height += 1
    }
    return height
}

export function logiChanged(ps: readonly Payload []): boolean {
    const res = ps.find(p => isHierarchyPayload(p) || isSourcePayload(p) ||
        isModifierPayload(p) || isSetFormulaPayload(p) || isSheetPayload(p) ||
        isStdHeaderPayload(p) || isUndoPayload(p) || isRedoPayload(p))
    return res !== undefined
}
