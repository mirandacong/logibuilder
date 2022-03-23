import {KeyboardEventCode} from '@logi/base/ts/common/key_code'

import {Status, StatusBuilder} from '../../status/entry'
import {TextStatusBuilder} from '../../status/textbox'
import {
    Action,
    ControllerActionBuilder,
    ControllerActionType,
    HandleResult,
    HandleResultBuilder,
} from '../result'

import {
    addPair,
    addText,
    deleteText,
    isCursorInPair,
    isNextChar,
    jumpToNextWord,
    Orientation,
    selectCandidate,
    setPanelSelected,
} from './base'

const MAX_ITEMS = 255

export function getKeybindings(): readonly (readonly [string, Action])[] {
    return [
        ...getCommonBindings(),
        ...getArrowBindings(),
        ...getParenBindings(),
        ...getDirectiveBindings(),
    ]
}

// tslint:disable-next-line: max-func-body-length
function getCommonBindings(): readonly (readonly [string, Action])[] {
    return [
        [
            'Ctrl+KeyA',
            (curr: Status): HandleResult => {
                const txtStatus = new TextStatusBuilder(curr.textStatus)
                    .startOffset(0)
                    .endOffset(curr.textStatus.text.length)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(txtStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Ctrl+Backspace',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const offset = jumpToNextWord(
                    Orientation.LEFT,
                    txtStatus.text,
                    txtStatus.endOffset,
                )
                const status = new TextStatusBuilder(txtStatus)
                    .endOffset(offset)
                    .startOffset(txtStatus.endOffset)
                    .build()
                const newTxtStatus = deleteText(status)
                const newStatus = new StatusBuilder(curr)
                    .textStatus(newTxtStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .txtPush(true)
                    .build()
            },
        ],
        [
            'Ctrl+KeyV',
            (curr: Status, paste?: unknown): HandleResult => {
                const txtStatus = curr.textStatus
                if (paste === undefined)
                    return new HandleResultBuilder().newStatus(curr).build()
                if (typeof paste !== 'string')
                    return new HandleResultBuilder().newStatus(curr).build()
                const status = addText(txtStatus, paste)
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .txtPush(true)
                    .build()
            },
        ],
        [
            'Backspace',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.processed) {
                    const directive = new ControllerActionBuilder()
                        .type(ControllerActionType.CONTROLLER_UNDO)
                        .build()
                    return new HandleResultBuilder()
                        .intellisense(false)
                        .showPanel(true)
                        .newStatus(curr)
                        .directive(directive)
                        .build()
                }
                let txtStatus = curr.textStatus
                if (isCursorInPair(txtStatus, '{', '}')
                    || isCursorInPair(txtStatus, '[', ']')
                    || isCursorInPair(txtStatus, '(', ')')
                    || isCursorInPair(txtStatus, '"', '"')) {
                    const deleteOne = deleteText(txtStatus)
                    const moveRight = new TextStatusBuilder(deleteOne)
                        .endOffset(deleteOne.endOffset + 1)
                        .startOffset(deleteOne.startOffset + 1)
                        .build()
                    txtStatus = deleteText(moveRight)
                } else if (txtStatus.endOffset > 0
                    || txtStatus.endOffset !== txtStatus.startOffset)
                    txtStatus = deleteText(txtStatus)
                const newStatus = new StatusBuilder(curr)
                    .textStatus(txtStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .intellisense(txtStatus.text.length > 0)
                    .showFuncUsage(true)
                    .showPanel(false)
                    .txtPush(true)
                    .build()
            },
        ],
        [
            'Delete',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                if (txtStatus.startOffset === txtStatus.text.length)
                    return new HandleResultBuilder().newStatus(curr).build()
                const semi = new TextStatusBuilder(txtStatus)
                    .startOffset(txtStatus.startOffset + 1)
                    .endOffset(txtStatus.startOffset + 1)
                    .build()
                const status = deleteText(semi)
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .intellisense(status.text.length > 0)
                    .showFuncUsage(true)
                    .txtPush(true)
                    .build()
            },
        ],
        [
            'Tab',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.selected >= 0)
                    return selectCandidate(curr)
                const d = new ControllerActionBuilder()
                    .type(ControllerActionType.SKIP_BACK)
                    .build()
                return new HandleResultBuilder()
                    .directive(d)
                    .newStatus(curr)
                    .build()
            },
        ],
        [
            'Home',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const newTextStatus = new TextStatusBuilder(txtStatus)
                    .startOffset(0)
                    .endOffset(0)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(newTextStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'End',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const newTxtStatus = new TextStatusBuilder(txtStatus)
                    .startOffset(txtStatus.text.length)
                    .endOffset(txtStatus.text.length)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(newTxtStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Enter | NumpadEnter',
            (curr: Status): HandleResult => {
                const panel = curr.panelStatus
                if (panel.selected < 0) {
                    const directive = new ControllerActionBuilder()
                        .type(ControllerActionType.SKIP_NEXT)
                        .build()
                    return new HandleResultBuilder()
                        .directive(directive)
                        .newStatus(curr)
                        .build()
                }
                return selectCandidate(curr)
            },
        ],
    ]
}

// tslint:disable-next-line: max-func-body-length
function getArrowBindings(): readonly (readonly [string, Action])[] {
    return [
        [
            'ArrowLeft',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const offset = Math.max(txtStatus.startOffset - 1, 0)
                const status = new TextStatusBuilder(txtStatus)
                    .endOffset(offset)
                    .startOffset(offset)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'ArrowRight',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const offset = Math.min(
                    txtStatus.text.length,
                    txtStatus.startOffset + 1,
                )
                const status = new TextStatusBuilder(txtStatus)
                    .startOffset(offset)
                    .endOffset(offset)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Ctrl+ArrowLeft',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const offset = jumpToNextWord(
                    Orientation.LEFT,
                    txtStatus.text,
                    txtStatus.startOffset,
                )
                const status = new TextStatusBuilder(txtStatus)
                    .startOffset(offset)
                    .endOffset(offset)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Ctrl+ArrowRight',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const offset = jumpToNextWord(
                    Orientation.RIGHT,
                    txtStatus.text,
                    txtStatus.startOffset,
                )
                const status = new TextStatusBuilder(txtStatus)
                    .startOffset(offset)
                    .endOffset(offset)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Ctrl+Shift+ArrowLeft',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                if (txtStatus.endOffset === 0)
                    return new HandleResultBuilder().newStatus(curr).build()
                const offset = jumpToNextWord(
                    Orientation.LEFT,
                    txtStatus.text,
                    txtStatus.endOffset,
                )
                const status = new TextStatusBuilder(txtStatus)
                    .endOffset(offset)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Ctrl+Shift+ArrowRight',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                const offset = jumpToNextWord(
                    Orientation.RIGHT,
                    txtStatus.text,
                    txtStatus.endOffset,
                )
                const status = new TextStatusBuilder(txtStatus)
                    .endOffset(offset)
                    .build()
                const newStatus = new StatusBuilder(curr)
                    .textStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'ArrowUp',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.selected < 0) {
                    const directive = new ControllerActionBuilder()
                        .type(ControllerActionType.SKIP_LAST)
                        .build()
                    return new HandleResultBuilder()
                        .directive(directive)
                        .newStatus(curr)
                        .build()
                }
                const panel = curr.panelStatus
                const currSelected = panel.selected
                const newPanelStatus = setPanelSelected(currSelected - 1, panel)
                const newStatus = new StatusBuilder(curr)
                    .panelStatus(newPanelStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(true)
                    .build()
            },
        ],
        [
            'ArrowDown',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.selected < 0) {
                    const directive = new ControllerActionBuilder()
                        .type(ControllerActionType.SKIP_NEXT)
                        .build()
                    return new HandleResultBuilder()
                        .directive(directive)
                        .newStatus(curr)
                        .build()
                }
                const panel = curr.panelStatus
                const currSelected = panel.selected
                const newPanelStatus = setPanelSelected(currSelected + 1, panel)
                const newStatus = new StatusBuilder(curr)
                    .panelStatus(newPanelStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(true)
                    .build()
            },
        ],
        [
            'Ctrl+ArrowUp',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.selected < 0)
                    return new HandleResultBuilder()
                        .newStatus(curr)
                        .showPanel(false)
                        .build()
                const panel = curr.panelStatus
                const newPanelStatus = setPanelSelected(0, panel)
                const newStatus = new StatusBuilder(curr)
                    .panelStatus(newPanelStatus)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(true)
                    .build()
            },
        ],
        [
            'Ctrl+ArrowDown',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.selected < 0)
                    return new HandleResultBuilder()
                        .newStatus(curr)
                        .showPanel(false)
                        .build()
                const panel = curr.panelStatus
                const status = setPanelSelected(MAX_ITEMS, panel)
                const newStatus = new StatusBuilder(curr)
                    .panelStatus(status)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .showPanel(true)
                    .build()
            },
        ],

    ]
}

// tslint:disable-next-line: max-func-body-length
function getParenBindings(): readonly (readonly [string, Action])[] {
    return [
        [// Input '('
            'Shift+Digit9',
            (curr: Status): HandleResult => addPair(curr, '(', ')'),
        ],
        [// Input ')'
            'Shift+Digit0',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                if (isNextChar(txtStatus, ')')) {
                    const t = new TextStatusBuilder(txtStatus)
                        .endOffset(txtStatus.endOffset + 1)
                        .startOffset(txtStatus.startOffset + 1)
                        .build()
                    const s = new StatusBuilder(curr).textStatus(t).build()
                    return new HandleResultBuilder().newStatus(s).build()
                }
                const txt = addText(txtStatus, ')')
                const newStatus = new StatusBuilder(curr)
                    .textStatus(txt)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .txtPush(true)
                    .build()
            },
        ],
        [// Input '{'
            'Shift+BracketLeft',
            (curr: Status): HandleResult => addPair(curr, '{', '}'),
        ],
        [// Input '}'
            'Shift+BracketRight',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                if (isNextChar(txtStatus, '}')) {
                    const t = new TextStatusBuilder(txtStatus)
                        .endOffset(txtStatus.endOffset + 1)
                        .startOffset(txtStatus.startOffset + 1)
                        .build()
                    const s = new StatusBuilder(curr).textStatus(t).build()
                    return new HandleResultBuilder().newStatus(s).build()
                }
                const txt = addText(txtStatus, '}')
                const newStatus = new StatusBuilder(curr)
                    .textStatus(txt)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .txtPush(true)
                    .build()
            },
        ],
        [// Input '['
            'BracketLeft',
            (curr: Status): HandleResult => addPair(curr, '[', ']'),
        ],
        [// Input ']'
            'BracketRight',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                if (isNextChar(txtStatus, ']')) {
                    const t = new TextStatusBuilder(txtStatus)
                        .endOffset(txtStatus.endOffset + 1)
                        .startOffset(txtStatus.startOffset + 1)
                        .build()
                    const s = new StatusBuilder(curr).textStatus(t).build()
                    return new HandleResultBuilder().newStatus(s).build()
                }
                const txt = addText(txtStatus, ']')
                const newStatus = new StatusBuilder(curr)
                    .textStatus(txt)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(newStatus)
                    .txtPush(true)
                    .build()
            },
        ],
        [// Input '"'
            'Shift+Quote',
            (curr: Status): HandleResult => {
                const txtStatus = curr.textStatus
                if (isNextChar(txtStatus, '"')) {
                    const t = new TextStatusBuilder(txtStatus)
                        .endOffset(txtStatus.endOffset + 1)
                        .startOffset(txtStatus.startOffset + 1)
                        .build()
                    const s = new StatusBuilder(curr).textStatus(t).build()
                    return new HandleResultBuilder().newStatus(s).build()
                }
                return addPair(curr, '"', '"')
            },
        ],
    ]
}

// tslint:disable-next-line: max-func-body-length
function getDirectiveBindings(): readonly (readonly [string, Action])[] {
    return [
        [
            'Ctrl+KeyC',
            (curr: Status): HandleResult => {
                const start = curr.textStatus.startOffset
                const end = curr.textStatus.endOffset
                const selected = start <= end ?
                    curr.textStatus.text.slice(start, end).join('') :
                    curr.textStatus.text.slice(end, start).join('')
                const directive = new ControllerActionBuilder()
                    .type(ControllerActionType.COPY)
                    .data(selected)
                    .build()
                return new HandleResultBuilder()
                    .intellisense(false)
                    .newStatus(curr)
                    .directive(directive)
                    .build()
            }
            ,
        ],
        [
            'Ctrl+KeyX',
            (curr: Status): HandleResult => {
                const start = curr.textStatus.startOffset
                const end = curr.textStatus.endOffset
                if (start === end)
                    return new HandleResultBuilder().newStatus(curr).build()
                const selected = start <= end ?
                    curr.textStatus.text.slice(start, end).join('') :
                    curr.textStatus.text.slice(end, start).join('')
                const directive = new ControllerActionBuilder()
                    .type(ControllerActionType.CUT)
                    .data(selected)
                    .build()
                const text = deleteText(curr.textStatus)
                const newStatus = new StatusBuilder(curr)
                    .textStatus(text)
                    .build()
                return new HandleResultBuilder()
                    .intellisense(false)
                    .newStatus(newStatus)
                    .directive(directive)
                    .build()
            }
            ,
        ],
        [
            'Escape',
            (curr: Status): HandleResult => {
                if (curr.panelStatus.selected < 0) {
                    const directive = new ControllerActionBuilder()
                        .type(ControllerActionType.BLUR)
                        .build()
                    return new HandleResultBuilder()
                        .newStatus(curr)
                        .directive(directive)
                        .build()
                }
                return new HandleResultBuilder()
                    .newStatus(curr)
                    .showPanel(false)
                    .build()
            },
        ],
        [
            'Ctrl+KeyS',
            (curr: Status): HandleResult => {
                const directive = new ControllerActionBuilder()
                    .type(ControllerActionType.SAVE)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(curr)
                    .directive(directive)
                    .build()
            },
        ],
        [
            'Ctrl+KeyZ',
            (curr: Status): HandleResult => {
                const directive = new ControllerActionBuilder()
                    .type(ControllerActionType.CONTROLLER_UNDO)
                    .build()
                return new HandleResultBuilder()
                    .intellisense(false)
                    .showPanel(true)
                    .newStatus(curr)
                    .directive(directive)
                    .build()
            },
        ],
        [
            'Ctrl+KeyY',
            (curr: Status): HandleResult => {
                const directive = new ControllerActionBuilder()
                    .type(ControllerActionType.CONTROLLER_REDO)
                    .build()
                return new HandleResultBuilder()
                    .intellisense(false)
                    .newStatus(curr)
                    .directive(directive)
                    .build()
            },
        ],
    ]
}

/**
 * Ignore these keyboard keys.
 */
export function getIgnoreKeys(): readonly string[] {
    return [
        KeyboardEventCode.ALT_LEFT,
        KeyboardEventCode.ALT_RIGHT,
        KeyboardEventCode.ARROW_DOWN,
        KeyboardEventCode.ARROW_LEFT,
        KeyboardEventCode.ARROW_RIGHT,
        KeyboardEventCode.ARROW_UP,
        KeyboardEventCode.BACKSPACE,
        KeyboardEventCode.CAPS_LOCK,
        KeyboardEventCode.CONTROL_LEFT,
        KeyboardEventCode.CONTROL_RIGHT,
        KeyboardEventCode.DELETE,
        KeyboardEventCode.ENTER,
        KeyboardEventCode.F1,
        KeyboardEventCode.F2,
        KeyboardEventCode.F3,
        KeyboardEventCode.F4,
        KeyboardEventCode.F5,
        KeyboardEventCode.F6,
        KeyboardEventCode.F7,
        KeyboardEventCode.F8,
        KeyboardEventCode.F9,
        KeyboardEventCode.F10,
        KeyboardEventCode.F11,
        KeyboardEventCode.F12,
        KeyboardEventCode.FN_LOCK,
        KeyboardEventCode.INSERT,
        KeyboardEventCode.METALEFT,
        KeyboardEventCode.META_RIGHT,
        KeyboardEventCode.NUM_LOCK,
        KeyboardEventCode.NUMPAD_ENTER,
        KeyboardEventCode.SHIFT_LEFT,
        KeyboardEventCode.SHIFT_RIGHT,
    ]
// tslint:disable-next-line: max-file-line-count
}
