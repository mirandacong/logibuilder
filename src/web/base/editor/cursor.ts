import {ElementRange, ElementRangeBuilder} from './element_range'
import {ElementRange as EditorRange} from './range'

/**
 * About `Selection` and `Range` API, see:
 *     https://developer.mozilla.org/en-US/docs/Web/API/Selection.
 *     https://developer.mozilla.org/en-US/docs/Web/API/Range.
 */

/**
 * Reference from:
 *     https://stackoverflow.com/questions/16095155/javascript-contenteditable-set-cursor-caret-to-index.
 *
 * Get selection based on character offset
 *                     current selection (with one range)
 *             |<===========================|
 *  {     r o w 1    }       +       {     r o w 2    }
 *  -     -------    -       -       -     -------    -
 * span1   span2    span3  span4    span5   span6    span7
 * |-----------------------------------------------------|
 *                     container
 *
 * Selection is:
 * {
 *     anchorNode: <text node of span6>,
 *     anchorOffset: 1,
 *     focusNode: <text node of span2>,
 *     focusOffset: 3,
 *     isCollapsed: false,
 * }
 *
 * Range is:
 * {
 *     startContainer: <text node of span2>
 *     startOffset: 3,
 *     endContainer: <text node of span6>
 *     endOffset: 1,
 *     collapsed: false,
 * }
 *
 * It will return:
 * {
 *     start: 4,
 *     end: 11,
 * }
 *
 * TODO (kai): split to dom => selection, selection => element range, and write
 * unit test.
 */
export function getElementRange(element: HTMLElement): ElementRange {
    const selection = window.getSelection()
    if (selection === null || selection.rangeCount === 0)
        return {start: 0, end: 0}
    const range = selection.getRangeAt(0)
    const clonedRange = range.cloneRange()
    /**
     * This will modify `clonedRange` to:
     * {
     *     startContainer: `container`
     *     startOffset: 0,
     *     endContainer: `container`
     *     endOffset: 9,
     * }
     */
    clonedRange.selectNodeContents(element)
    /**
     * This will modify `clonedRange` to:
     * {
     *     startContainer: `container`
     *     startOffset: 0,
     *     endContainer: <text node of span2>
     *     endOffset: 3,
     * }
     */
    clonedRange.setEnd(range.startContainer, range.startOffset)
    /**
     * `toString()` returns the text of the range. It is 4.
     */
    const start = clonedRange.toString().length
    return new ElementRangeBuilder()
        .start(start)
        .end(start + range.toString().length)
        .build()
}

export function setRange(range: EditorRange): void {
    const newRange = document.createRange()
    const getTextNode = (nodes: NodeListOf<Node>): Node | undefined => {
        let textNode: Node | undefined
        nodes.forEach(n => {
            if (n.nodeType !== n.TEXT_NODE)
                return
            textNode = n
        })
        return textNode
    }
    const startNode = getTextNode(range.start.node.childNodes)
    const endNode = getTextNode(range.end.node.childNodes)
    /**
     * TODO(minglong): refactor this function to combine `setRange` and
     * `setElementRange`
     */
    if (startNode === undefined || endNode === undefined) {
        setElementRange(range.start.node, new ElementRangeBuilder()
            .start(0)
            .end(0)
            .build())
        return
    }
    newRange.setStart(startNode, range.start.offset)
    newRange.setEnd(endNode, range.end.offset)
    newRange.collapse(true)
    const sel = window.getSelection()
    if (sel === null)
        return
    /**
     * TODO (kai): It will trigger selectionchange event twice here for both of
     * `removeAllRanges` and `addRange` can make selection to change.
     */
    sel.removeAllRanges()
    sel.addRange(newRange)
}

/**
 * Reference from:
 *     https://stackoverflow.com/questions/16095155/javascript-contenteditable-set-cursor-caret-to-index.
 */
export function setElementRange(element: Node, selection: ElementRange): void {
    const range = document.createRange()
    range.setStart(element, 0)
    range.collapse(true)
    const nodeStack = [element]
    let foundStart = false
    let stop = false
    let node = nodeStack.pop()
    let charIndex = 0
    /**
     * Pre-order walk for children of container.
     */
    while (!stop && node) {
        if (node.nodeType === node.TEXT_NODE) {
            const nextCharIndex = charIndex + (node as Text).length
            if (!foundStart && selection.start >= charIndex
                    && selection.start <= nextCharIndex) {
                range.setStart(node, selection.start - charIndex)
                foundStart = true
            }
            if (foundStart && selection.end >= charIndex
                    && selection.end <= nextCharIndex) {
                range.setEnd(node, selection.end - charIndex)
                stop = true
            }
            charIndex = nextCharIndex
        } else {
            let i = node.childNodes.length
            while (i) {
                i -= 1
                nodeStack.push(node.childNodes[i])
            }
        }
        node = nodeStack.pop()
    }

    const sel = window.getSelection()
    if (sel === null)
        return
    sel.removeAllRanges()
    sel.addRange(range)
}

export function getCaretOffsetInPx(): number {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0)
        return 0
    const range = selection.getRangeAt(0)
    const end = range.endContainer
    if (end.nodeType === end.TEXT_NODE)
        return end.parentElement?.offsetLeft || 0
    return (end as HTMLElement).offsetLeft || 0
}

/**
 * Get character offset when get mouse event.
 *                           mouse event trigger here
 *                                      |
 *                                      v
 *  {     row1    }       +       {     row2    }
 *  -     ----    -       -       -     ----    -
 * span1  span2  span3   span4  span5   span6  span7
 *
 * it will return 9.
 *
 * TODO (kai): Understand and refactor.
 */
export function getCharOffset(e: MouseEvent): number {
    const posx = e.pageX || e.clientX
    const posy = e.pageY || e.clientY
    /**
     * vs/editor/browser/controller/mouseTarget.ts
     *  _doHitTestWithCaretRangeFromPoint()
     */
    const clientx = posx - window.scrollX
    const clienty = posy - window.scrollY

    const range = document.caretRangeFromPoint(clientx, clienty)
    if (range === undefined || range === null || range.startContainer === undefined)
        return 0

    const spanOffset = range.startOffset
    const startContainer = range.startContainer

    let charCount = 0
    if (startContainer.nodeType === startContainer.TEXT_NODE) {
        let span = startContainer.parentNode
        if (span === null)
            return 0
        while (span) {
            span = span.previousSibling as HTMLElement
            if (span) {
                const text = span.textContent
                charCount += text ? text.length : 0
            }
        }
    }

    return charCount + spanOffset
}
