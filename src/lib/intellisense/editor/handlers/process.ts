import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    getNodesVisitor,
    isFormulaBearer,
    isRow,
    Label,
    Node,
    NodeType,
    simplifyPath,
} from '@logi/src/lib/hierarchy/core'
import {
    ViewPart,
    ViewPartBuilder,
    ViewType,
} from '@logi/src/lib/intellisense/editor/display'
import {
    Candidate,
    CandidateBuilder,
    CandidateHandleBuilder,
    CandidateType,
} from '@logi/src/lib/intellisense/suggest'
import {findParent} from '@logi/src/lib/intellisense/utils'

import {
    PanelStatus,
    PanelStatusBuilder,
    PanelUnit,
    PanelUnitBuilder,
} from '../status/panel'
import {TextStatus, TextStatusBuilder} from '../status/textbox'

export function processCandidate(c: Candidate): PanelStatus | undefined {
    if (c.handle === undefined)
        return
    switch (c.source) {
    case CandidateType.REFNAME:
        return processRefname(c)
    case CandidateType.PROCESS_PATH:
        return processPath(c)
    default:
    }
    return
}

/**
 * Indicating the process of the suggest status.
 *
 * When providing refname suggestions, we follow these steps:
 *  1. Help user to determine the refname.
 *  2. Help user to choose if the path should be displayed in editor text
 *     (only one hierarchy node has this name)
 *     or to choose which node he exactly wants(several nodes share this name).
 *  3. Help user to choose the selections.
 *
 * The 2nd and 3rd steps are optional. User can ignore the suggest panel and
 * go on typing.
 */
// tslint:disable-next-line: max-func-body-length
function processRefname(candidate: Candidate): PanelStatus | undefined {
    if (candidate.handle === undefined)
        return
    const nodes = candidate.handle.nodes
    const newCands = nodes.map((
        node: Readonly<Node>,
        idx: number,
    ): Candidate => {
        const path = isFormulaBearer(node) &&
            candidate.handle?.base !== undefined
            ? simplifyPath(node, candidate.handle.base).toString()
            : node.getPath().toString()
        const view: ViewPart[] = []
        if (candidate.handle?.base !== undefined) {
            const annotation = getAnnotation(candidate.handle.base, node)
            if (annotation !== undefined)
                view.push(annotation)
        }
        view.push(new ViewPartBuilder()
            .content(path)
            .type(ViewType.PATH)
            .build())
        return new CandidateBuilder(candidate)
            .updateText(`{${path}}`)
            .source(CandidateType.PROCESS_PATH)
            .handle(new CandidateHandleBuilder()
                .base(candidate.handle?.base)
                .nodes([nodes[idx]])
                .build(),
            )
            .cursorOffest(`${candidate.prefix}{${path}}`.length)
            .view(view)
            .build()
    })
    const selCands: Candidate[] = []
    nodes.forEach((n: Readonly<Node>): void => {
        const selections = getSelection(n)
        selections.forEach((s: string): void => {
            if (selCands.find((c: Candidate): boolean =>
                c.view[0].content === s))
                return
            selCands.push(new CandidateBuilder(candidate)
                .updateText(`{${n.name}}[${s}]`)
                .cursorOffest(`${candidate.prefix}{${n.name}}[${s}]`.length)
                .view([new ViewPartBuilder()
                    .type(ViewType.SLICE)
                    .content(`${s}`)
                    .build()])
                .handle(new CandidateHandleBuilder()
                    .base(candidate.handle?.base)
                    .nodes([n])
                    .build(),
                )
                .source(CandidateType.PROCESS_SELECTION)
                .build())
        })
    })
    newCands.push(...selCands)
    const panelUnits = newCands.map((c: Candidate): PanelUnit =>
        new PanelUnitBuilder().parts(c.view).entity(c).build())
    return new PanelStatusBuilder()
        .page(panelUnits)
        .selected(0)
        .processed(true)
        .build()
}

function processPath(candidate: Candidate): PanelStatus | undefined {
    if (candidate.handle === undefined)
        return
    const node = candidate.handle.nodes[0]
    const selections = getSelection(node)
    const newCands = selections.map((s: string): Candidate => {
        const path = isFormulaBearer(node) &&
            candidate.handle?.base !== undefined
            ? simplifyPath(node, candidate.handle.base).toString()
            : node.getPath().toString()
        const update = `{${path}}[${s}]`
        return new CandidateBuilder(candidate)
            .updateText(update)
            .cursorOffest(`${candidate.prefix}${update}`.length)
            .source(CandidateType.PROCESS_SELECTION)
            .view([new ViewPartBuilder()
                .content(s)
                .type(ViewType.SLICE)
                .build()])
            .build()
    })
    const panelUnits = newCands.map((c: Candidate): PanelUnit =>
        new PanelUnitBuilder().parts(c.view).entity(c).build())
    return new PanelStatusBuilder()
        .page(panelUnits)
        .selected(0)
        .processed(true)
        .build()
}

function getSelection(node: Readonly<Node>): readonly string[] {
    const table = findParent(
        node,
        (curr: Readonly<Node>, arg: NodeType): boolean => curr.nodetype === arg,
        NodeType.TABLE,
    )
    const target = isRow(node)
        ? [NodeType.COLUMN, NodeType.COLUMN_BLOCK]
        : [NodeType.ROW, NodeType.ROW_BLOCK]
    const fbs = preOrderWalk2(table, getNodesVisitor, target)
    /**
     * The key is the col label or the col name, the value is the frequency of
     * this key.
     */
    const slicesMap = new Map<string, number>()
    const fbsMap = new Map < string, number>()
    // tslint:disable-next-line: no-loop
    for (const fb of fbs) {
        fb.labels.forEach((l: Label): void => {
            if (typeof l !== 'string')
                return
            const sliceNum = slicesMap.get(l)
            slicesMap.set(l, sliceNum === undefined ? 1 : sliceNum + 1)
        })
        const fbNum = fbsMap.get(fb.name)
        fbsMap.set(fb.name, fbNum === undefined ? 1 : fbNum + 1)
    }
    const slices = sortMapKey(slicesMap)
    const sortedFbs = sortMapKey(fbsMap)
    return [...slices, ...sortedFbs]
}

/**
 * Sort the keys in map according to the frequency saved in map values.
 */
function sortMapKey(map: Map<string, number>): readonly string[] {
    const frequencies = Array.from(map.values()).sort()
    return Array.from(map.keys()).sort((a: string, b: string): number => {
        const aIdx = frequencies.indexOf(map.get(a) ?? 0)
        const bIdx = frequencies.indexOf(map.get(b) ?? 0)
        if (aIdx === bIdx)
            return a < b ? -1 : 1
        return bIdx - aIdx
    })
}

export function getCandidateText(candidate: Candidate): TextStatus {
    const text = candidate.prefix + candidate.updateText + candidate.suffix
    const offset = candidate.cursorOffset
    return new TextStatusBuilder()
        .text(text.split(''))
        .startOffset(offset)
        .endOffset(offset)
        .build()
}

export function getAnnotation(
    base: Readonly<Node>,
    curr: Readonly<Node>,
): ViewPart | undefined {
    let annotationTxt = ''
    if (base.findParent(NodeType.TABLE) === curr.findParent(NodeType.TABLE))
        annotationTxt = '本表'
    if (base === curr)
        annotationTxt = '自己'
    if (annotationTxt === '')
        return
    return new ViewPartBuilder()
        .content(`(${annotationTxt}) `)
        .type(ViewType.ANNOTATION)
        .build()
}

/**
 * To check if there are nodes share the same path. If true, return their one
 * label that help user identify them.
 *
 * NOTICE: Export this function only for test.
 */
export function getIdentifiedLabel(
    nodes: readonly Readonly<Node>[],
): Map<Readonly<Node>, string> {
    const recorder = new Map<string, Readonly<Node>[]>()
    nodes.forEach((n: Readonly<Node>): void => {
        const p = n.getPath().toString().split(':')[1]
        const value = recorder.get(p)
        if (value !== undefined)
            value.push(n)
        else
            recorder.set(p, [n])
    })
    const result = new Map<Readonly<Node>, string>()
    recorder.forEach((v: Readonly<Node>[]): void => {
        if (v.length <= 1)
            return
        const counter = new Map<string, number>()
        const labelsRecorder = new Map<Readonly<Node>, string[]>()
        v.forEach((n: Readonly<Node>): void => {
            n.labels.forEach((l: Label): void => {
                if (typeof l !== 'string')
                    return
                counter.set(l, (counter.get(l) ?? 0) + 1)
                const currLabels = labelsRecorder.get(n)
                if (currLabels === undefined)
                    labelsRecorder.set(n, [l])
                else
                    currLabels.push(l)
            })
        })
        labelsRecorder.forEach((labels: string[], n: Readonly<Node>): void => {
            const l = labels.find((label: string): boolean => {
                const count = counter.get(label) ?? 0
                return count === 1
            })
            if (l === undefined)
                return
            result.set(n, `[[${l}]]`)
        })
    })
    return result
}
