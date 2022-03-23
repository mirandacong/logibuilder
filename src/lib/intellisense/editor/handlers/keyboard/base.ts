import {
    EditorDisplayUnit,
    EditorDisplayUnitBuilder,
} from '@logi/src/lib/intellisense/editor/display'
import {
    Candidate,
    isCandidate,
} from '@logi/src/lib/intellisense/suggest/solutions/candidate'

import {UnitType} from '../../display/textbox/unit_type'
import {Status, StatusBuilder} from '../../status/entry'
import {PanelStatus, PanelStatusBuilder} from '../../status/panel'
import {TextStatus, TextStatusBuilder} from '../../status/textbox'
import {getCandidateText, processCandidate} from '../process'
import {HandleResult, HandleResultBuilder} from '../result'

/**
 * Return the offset of the next word.
 *
 * NOTE:Export this function only for test.
 */
export function jumpToNextWord(
    orientation: Orientation,
    text: readonly (string | EditorDisplayUnit)[],
    offset: number,
): number {
    const stopChars = '!:{}+-*.[]'
    if (orientation === Orientation.LEFT) {
        if (offset === 0)
            return offset
        let result = offset - 1
        while (result !== 0) {
            const cur = text[result - 1]
            if (typeof cur === 'string' && stopChars.includes(cur))
                break
            if (typeof cur !== 'string')
                break
            result -= 1
        }
        return Math.max(result, 0)
    }
    if (offset === text.length)
        return offset
    let curr = offset + 1
    if (curr > text.length + 1)
        return offset
    while (curr !== text.length) {
        const ele = text[curr]
        if (typeof ele === 'string' && stopChars.includes(ele))
            break
        if (typeof ele !== 'string')
            break
        curr += 1
    }
    return curr
}

/**
 * Input string into the text.
 */
export function addText(status: TextStatus, update: string): TextStatus {
    let text: (string | EditorDisplayUnit)[] = []
    let curr = status
    if (curr.endOffset === curr.startOffset && curr.endOffset < 0)
        return status
    if (status.endOffset !== status.startOffset)
        curr = deleteText(status)
    const prefix = curr.text.slice(0, curr.startOffset)
    const suffix = curr.text.slice(curr.startOffset)
    text = [...prefix, ...update.split(''), ...suffix]
    const offsetDelta = text.length - curr.text.length
    const newOffset = Math.max(
        Math.min(text.length, curr.startOffset + offsetDelta),
        0,
    )
    return new TextStatusBuilder(curr)
        .startOffset(newOffset)
        .endOffset(newOffset)
        .text(text)
        .build()
}

/**
 * Delete the selected text or the char before the cursor.
 */
export function deleteText(status: TextStatus): TextStatus {
    if (status.endOffset !== status.startOffset) {
        const [start, end]: [number, number] =
            status.startOffset > status.endOffset ?
            [status.endOffset, status.startOffset] :
            [status.startOffset, status.endOffset]
        const prefix = status.text.slice(0, start)
        const suffix = status.text.slice(end)
        const text = [...prefix, ...suffix]
        return new TextStatusBuilder(status)
            .text(text)
            .startOffset(start)
            .endOffset(start)
            .build()
    }
    if (status.endOffset === 0)
        return status
    const pre = status.text.slice(0, status.endOffset - 1)
    const suf = status.text.slice(status.endOffset)
    const newText = [...pre, ...suf]
    const newOffset = Math.max(status.endOffset - 1, 0)
    return new TextStatusBuilder(status)
        .startOffset(newOffset)
        .endOffset(newOffset)
        .text(newText)
        .build()
}

export const enum Orientation {
    LEFT,
    RIGHT,
}

export function setPanelSelected(i: number, status: PanelStatus): PanelStatus {
    const idx = Math.min(Math.max(0, i), status.page.length - 1)
    return new PanelStatusBuilder(status).selected(idx).build()
}

export function convertFilter(status: TextStatus, filter: string): TextStatus {
    let currOffset = status.endOffset - 1
    if (currOffset < 0)
        return status
    const text = status.text
    let curr = text[currOffset]
    const buffer: string[] = []
    while (typeof curr === 'string' && curr !== '{' && currOffset > 0) {
        buffer.unshift(curr)
        currOffset -= 1
        curr = text[currOffset]
    }
    const filterUnit = new EditorDisplayUnitBuilder()
        .buffer(buffer.join(''))
        .indivisible(true)
        .content(filter)
        .tags([UnitType.FILTER])
        .build()
    const newText = [...status.text.slice(0, currOffset + 1),
        filterUnit,
        ...status.text.slice(status.endOffset)]
    return new TextStatusBuilder()
        .text(newText)
        .endOffset(status.endOffset - buffer.length + 1)
        .startOffset(status.endOffset - buffer.length + 1)
        .ime(false)
        .build()
}

export function previewCandidate(
    text: TextStatus,
    cand: Candidate,
): TextStatus {
    const result: (string | EditorDisplayUnit)[] = []
    result.push(...cand.prefix.split(''))
    const unit = new EditorDisplayUnitBuilder()
        .indivisible(true)
        .content(cand.updateText)
        .buffer(cand.from)
        .tags([UnitType.PREVIEW])
        .build()
    result.push(unit)
    result.push(...cand.suffix.split(''))
    const delta = cand.from.length - 1
    return new TextStatusBuilder()
        .text(result)
        .endOffset(text.endOffset - delta)
        .startOffset(text.endOffset - delta)
        .build()
}

export function selectCandidate(curr: Status): HandleResult {
    const panel = curr.panelStatus
    const unit = panel.getSelectedUnit()
    const entity = unit.entity
    if (!isCandidate(entity))
        return new HandleResultBuilder().newStatus(curr).showPanel(true).build()
    const txt = getCandidateText(entity)
    const p = processCandidate(entity) ?? new PanelStatusBuilder()
        .processed(true)
        .build()
    const s = new StatusBuilder(curr).textStatus(txt).panelStatus(p).build()
    return new HandleResultBuilder()
        .intellisense(false)
        .newStatus(s)
        .showPanel(true)
        .showFuncUsage(true)
        .txtPush(true)
        .build()
}

/**
 * Add text `left` and `right` and put the offset between them.
 */
export function addPair(
    curr: Status,
    left: string,
    right: string,
): HandleResult {
    const status = addText(curr.textStatus, `${left}${right}`)
    const offset = status.endOffset - 1
    const newTxt = new TextStatusBuilder(status)
        .startOffset(offset)
        .endOffset(offset)
        .build()
    const newStatus = new StatusBuilder(curr).textStatus(newTxt).build()
    return new HandleResultBuilder().newStatus(newStatus).txtPush(true).build()
}

/**
 * Tell the offset if is in the `left` and `right`.
 */
export function isCursorInPair(
    textStatus: TextStatus,
    left: string,
    right: string,
): boolean {
    if (textStatus.endOffset !== textStatus.startOffset)
        return false
    const text = textStatus.text
    if (textStatus.endOffset === 0 || textStatus.endOffset === text.length)
        return false
    const pre = textStatus.endOffset - 1
    const next = textStatus.endOffset
    if (typeof text[pre] !== 'string' || typeof text[next] !== 'string')
        return false
    if (text[pre] === left && text[next] === right)
        return true
    return false
}

/**
 * Tell if the next char is equal to `target`.
 */
export function isNextChar(textStatus: TextStatus, target: string): boolean {
    const text = textStatus.text
    const offset = textStatus.endOffset
    if (offset !== textStatus.startOffset)
        return false
    if (offset >= text.length)
        return false
    if (typeof text[offset] !== 'string')
        return false
    if (text[offset] === target)
        return true
    return false
}

export function isInRef(textStatus: TextStatus): boolean {
    const left: string[] = []
    textStatus.text.slice(0, textStatus.startOffset).forEach((
        t: string | EditorDisplayUnit,
    ): void => {
        if (t === '{')
            left.push('{')
        if (t === '}')
            left.pop()
    })
    return left.length > 0
}
