// tslint:disable: no-type-assertion
// tslint:disable: no-magic-numbers
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {Book, BookBuilder} from '@logi/src/lib/hierarchy/core'
import {
    EditorDisplayUnit,
    EditorDisplayUnitBuilder,
    UnitType,
} from '@logi/src/lib/intellisense/editor/display'
import {
    EditorKeyboardEventBuilder,
    EditorLocation,
    EditorLocationBuilder,
    Location,
} from '@logi/src/lib/intellisense/editor/events'

import {Status, StatusBuilder} from '../../status/entry'
import {PanelStatusBuilder, PanelUnitBuilder} from '../../status/panel'
import {TextStatusBuilder} from '../../status/textbox'
import {ControllerActionType, HandleResult} from '../result'

import {KeyboardEventHandler} from './entry'

// tslint:disable-next-line: max-func-body-length
describe('keyboard event 1', (): void => {
    let handler: KeyboardEventHandler
    let status: Status
    let node: Readonly<Book>
    let location: EditorLocation
    beforeEach((): void => {
        const s: (string | EditorDisplayUnit)[] =
            '{ref:namespace} + {'.split('')
        s.push(new EditorDisplayUnitBuilder()
            .tags([UnitType.FILTER])
            .content('sale')
            .indivisible(true)
            .build())
        handler = new KeyboardEventHandler()
        const txtStatus = new TextStatusBuilder()
            .text(s)
            .startOffset(s.length)
            .endOffset(s.length)
            .build()
        node = new BookBuilder().name('dummy').build()
        location = new EditorLocationBuilder()
            .loc(Location.RIGHT)
            .node(node)
            .build()
        status = new StatusBuilder()
            .textStatus(txtStatus)
            .location(location)
            .build()
    })
    it('Ctrl+KeyA', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.KEY_A)
            .key('A')
            .build()
        const result = handler.updateStatus(status, event) as HandleResult
        expect(result.newStatus.textStatus.endOffset).toBeDefined()
        expect(result.intellisense).toBe(false)
        expect(result.newStatus.textStatus.startOffset).toBe(0)
        expect(result.newStatus.textStatus.endOffset).toBe(20)
    })
    it('Ctrl+ArrowLeft', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.ARROW_LEFT)
            .build()
        const result = handler.updateStatus(status, event) as HandleResult
        expect(result.intellisense).toBe(false)
        expect(result.newStatus.textStatus.startOffset).toBe(19)
    })
    it('Ctrl+ArrowRight', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.ARROW_RIGHT)
            .build()
        const result = handler.updateStatus(status, event) as HandleResult
        expect(result.intellisense).toBe(false)
        expect(result.newStatus.textStatus.startOffset).toBe(20)
    })
    it('Backspace', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BACKSPACE)
            .build()
        status = new StatusBuilder(status)
            .panelStatus(new PanelStatusBuilder().processed(true).build())
            .build()
        const result = handler.updateStatus(status, event) as HandleResult
        expect(result?.action.type).toBe(ControllerActionType.CONTROLLER_UNDO)
    })
    it('Ctrl+Backspace', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.BACKSPACE)
            .build()
        const result = handler.updateStatus(status, event) as HandleResult
        expect(result.intellisense).toBe(false)
        expect(result.newStatus.textStatus.startOffset).toBe(19)
        expect(result.newStatus.textStatus.text.length).toBe(19)
    })
    it('Delete', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.DELETE)
            .build()
        const result = handler.updateStatus(status, event) as HandleResult
        expect(result.intellisense).toBe(false)
        expect(result.newStatus.textStatus.startOffset)
            .toBe(status.textStatus.text.length)
    })
    it('ArrowDown', (): void => {
        const unit1 = new PanelUnitBuilder().parts([]).build()
        const unit2 = new PanelUnitBuilder().parts([]).build()
        const panelStatus = new PanelStatusBuilder()
            .page([unit1, unit2])
            .selected(0)
            .build()
        const curr = new StatusBuilder(status).panelStatus(panelStatus).build()
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.ARROW_DOWN)
            .build()
        const result = handler.updateStatus(curr, event)
        expect(result?.newStatus).toBeDefined()
        expect(result?.newStatus.panelStatus.selected).toBe(1)
        const status2 = result?.newStatus as Status
        const result2 = handler.updateStatus(status2, event)
        expect(result2?.newStatus.panelStatus.selected).toBe(1)
    })
    it('ArrowUp', (): void => {
        const unit1 = new PanelUnitBuilder().parts([]).build()
        const unit2 = new PanelUnitBuilder().parts([]).build()
        const panelStatus = new PanelStatusBuilder()
            .page([unit1, unit2])
            .selected(1)
            .build()
        const curr = new StatusBuilder(status).panelStatus(panelStatus).build()
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.ARROW_UP)
            .build()
        const result = handler.updateStatus(curr, event)
        expect(result?.newStatus).toBeDefined()
        expect(result?.newStatus.panelStatus.selected).toBe(0)
        const status2 = result?.newStatus as Status
        const result2 = handler.updateStatus(status2, event)
        expect(result2?.newStatus.panelStatus.selected).toBe(0)
    })
    it('Ctrl+ArrowDown', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.ARROW_DOWN)
            .build()
        const unit1 = new PanelUnitBuilder().parts([]).build()
        const unit2 = new PanelUnitBuilder().parts([]).build()
        const unit3 = new PanelUnitBuilder().parts([]).build()
        const unit4 = new PanelUnitBuilder().parts([]).build()
        const panelStatus = new PanelStatusBuilder()
            .page([unit1, unit2, unit3, unit4])
            .selected(3)
            .build()
        const curr = new StatusBuilder(status).panelStatus(panelStatus).build()
        const result = handler.updateStatus(curr, event)
        expect(result?.newStatus.panelStatus.selected).toBe(3)
    })
    it('Ctrl+ArrowUp', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.ARROW_UP)
            .build()
        const unit1 = new PanelUnitBuilder().parts([]).build()
        const unit2 = new PanelUnitBuilder().parts([]).build()
        const unit3 = new PanelUnitBuilder().parts([]).build()
        const unit4 = new PanelUnitBuilder().parts([]).build()
        const panelStatus = new PanelStatusBuilder()
            .page([unit1, unit2, unit3, unit4])
            .selected(3)
            .build()
        const curr = new StatusBuilder(status).panelStatus(panelStatus).build()
        const result = handler.updateStatus(curr, event)
        expect(result?.newStatus.panelStatus.selected).toBe(0)
    })
    it('Home', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.HOME)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.newStatus.textStatus.startOffset).toBe(0)
        expect(result?.newStatus.textStatus.endOffset).toBe(0)
        const curr = result?.newStatus as Status
        const result2 = handler.updateStatus(curr, event)
        expect(result2).toBeDefined()
        expect(result2?.newStatus.textStatus.startOffset).toBe(0)
        expect(result2?.newStatus.textStatus.endOffset).toBe(0)
    })
    it('End', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.END)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.newStatus.textStatus.startOffset).toBe(20)
        expect(result?.newStatus.textStatus.endOffset).toBe(20)
        const curr = result?.newStatus as Status
        const result2 = handler.updateStatus(curr, event)
        expect(result2).toBeDefined()
        expect(result2?.newStatus.textStatus.startOffset).toBe(20)
        expect(result2?.newStatus.textStatus.endOffset).toBe(20)
    })
    it('tab', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.TAB)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.newStatus.textStatus.endOffset).toBe(20)
        expect(result?.newStatus.textStatus.startOffset).toBe(20)
        expect(result?.action.type).toBe(ControllerActionType.SKIP_BACK)
    })
    it('Escape', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.ESCAPE)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.showPanel).toBe(false)
        const curr = result?.newStatus as Status
        const result2 = handler.updateStatus(curr, event)
        expect(result2).toBeDefined()
        expect(result2?.action.type).toBe(ControllerActionType.BLUR)
    })
    it('Ctrl+KeyS', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.KEY_S)
            .ctrlKey(true)
            .key('S')
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.action.type).toBe(ControllerActionType.SAVE)
    })
    it('Ctrl+KeyC', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.KEY_C)
            .key('C')
            .ctrlKey(true)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.action.type).toBe(ControllerActionType.COPY)
    })
    it('Ctrl+KeyX', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.KEY_X)
            .key('X')
            .ctrlKey(true)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.newStatus.textStatus.text.length)
            .toBe(status.textStatus.text.length)
        expect(result?.action.type).toBe(ControllerActionType.NONE)

        const txtStatus = new TextStatusBuilder(status.textStatus)
            .startOffset(1)
            .build()
        status = new StatusBuilder(status).textStatus(txtStatus).build()
        const result2 = handler.updateStatus(status, event)
        expect(result2?.action.type).toBe(ControllerActionType.CUT)
        expect(result2?.newStatus.textStatus.text.join('')).toBe('{')
    })
    it('Ctrl+KeyZ', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.KEY_Z)
            .key('Z')
            .ctrlKey(true)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.action.type).toBe(ControllerActionType.CONTROLLER_UNDO)
    })
    it('Ctrl+KeyY', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.KEY_Y)
            .key('Y')
            .ctrlKey(true)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        expect(result?.action.type).toBe(ControllerActionType.CONTROLLER_REDO)
    })
})

// tslint:disable-next-line: max-func-body-length
describe('parenthesis', (): void => {
    let handler: KeyboardEventHandler
    let status: Status
    let node: Readonly<Book>
    let location: EditorLocation
    beforeEach((): void => {
        const s: (string | EditorDisplayUnit)[] = []
        handler = new KeyboardEventHandler()
        const txtStatus = new TextStatusBuilder()
            .text(s)
            .startOffset(s.length)
            .endOffset(s.length)
            .build()
        node = new BookBuilder().name('dummy').build()
        location = new EditorLocationBuilder()
            .loc(Location.RIGHT)
            .node(node)
            .build()
        status = new StatusBuilder()
            .textStatus(txtStatus)
            .location(location)
            .build()
    })
    it('add pair {} and delete pair', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BRACKET_LEFT)
            .shiftKey(true)
            .build()
        const result = handler.updateStatus(status, event)
        const textStatus = result?.newStatus.textStatus
        expect(textStatus).toBeDefined()
        expect(textStatus?.endOffset).toBe(1)
        expect(textStatus?.startOffset).toBe(1)
        expect(textStatus?.text.length).toBe(2)
        expect(textStatus?.text[0]).toBe('{')
        expect(textStatus?.text[1]).toBe('}')
        const deleteEvent = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BACKSPACE)
            .build()
        const newStatus = result?.newStatus as Status
        const result2 = handler.updateStatus(newStatus, deleteEvent)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.endOffset).toBe(0)
        expect(txtStatus?.startOffset).toBe(0)
        expect(txtStatus?.text.length).toBe(0)
    })
    it('add pair [] and delete pair', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BRACKET_LEFT)
            .build()
        const result = handler.updateStatus(status, event)
        const textStatus = result?.newStatus.textStatus
        expect(textStatus).toBeDefined()
        expect(textStatus?.endOffset).toBe(1)
        expect(textStatus?.startOffset).toBe(1)
        expect(textStatus?.text.length).toBe(2)
        expect(textStatus?.text[0]).toBe('[')
        expect(textStatus?.text[1]).toBe(']')
        const deleteEvent = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BACKSPACE)
            .build()
        const newStatus = result?.newStatus as Status
        const result2 = handler.updateStatus(newStatus, deleteEvent)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.endOffset).toBe(0)
        expect(txtStatus?.startOffset).toBe(0)
        expect(txtStatus?.text.length).toBe(0)
    })
    it('add pair "" and delete pair', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .shiftKey(true)
            .code(KeyboardEventCode.QUOTE)
            .build()
        const result = handler.updateStatus(status, event)
        const textStatus = result?.newStatus.textStatus
        expect(textStatus).toBeDefined()
        expect(textStatus?.endOffset).toBe(1)
        expect(textStatus?.startOffset).toBe(1)
        expect(textStatus?.text.length).toBe(2)
        expect(textStatus?.text[0]).toBe('"')
        expect(textStatus?.text[1]).toBe('"')
        const deleteEvent = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BACKSPACE)
            .build()
        const newStatus = result?.newStatus as Status
        const result2 = handler.updateStatus(newStatus, deleteEvent)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.endOffset).toBe(0)
        expect(txtStatus?.startOffset).toBe(0)
        expect(txtStatus?.text.length).toBe(0)
    })
    it('add pair () and delete pair', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.DIGIT_9)
            .shiftKey(true)
            .build()
        const result = handler.updateStatus(status, event)
        const textStatus = result?.newStatus.textStatus
        expect(textStatus).toBeDefined()
        expect(textStatus?.endOffset).toBe(1)
        expect(textStatus?.startOffset).toBe(1)
        expect(textStatus?.text.length).toBe(2)
        expect(textStatus?.text[0]).toBe('(')
        expect(textStatus?.text[1]).toBe(')')
        const deleteEvent = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BACKSPACE)
            .build()
        const newStatus = result?.newStatus as Status
        const result2 = handler.updateStatus(newStatus, deleteEvent)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.endOffset).toBe(0)
        expect(txtStatus?.startOffset).toBe(0)
        expect(txtStatus?.text.length).toBe(0)
    })
    it('just move cursor when the next char is }', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BRACKET_LEFT)
            .shiftKey(true)
            .build()
        handler.updateStatus(status, event)
        const result = handler.updateStatus(status, event)
        const newStatus = result?.newStatus as Status
        const event2 = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BRACKET_RIGHT)
            .shiftKey(true)
            .build()
        const result2 = handler.updateStatus(newStatus, event2)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.text.length).toBe(2)
        expect(txtStatus?.endOffset).toBe(2)
        expect(txtStatus?.startOffset).toBe(2)
    })
    it('just move cursor when the next char is ]', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BRACKET_LEFT)
            .build()
        handler.updateStatus(status, event)
        const result = handler.updateStatus(status, event)
        const newStatus = result?.newStatus as Status
        const event2 = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.BRACKET_RIGHT)
            .build()
        const result2 = handler.updateStatus(newStatus, event2)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.text.length).toBe(2)
        expect(txtStatus?.endOffset).toBe(2)
        expect(txtStatus?.startOffset).toBe(2)
    })
    it('just move cursor when the next char is )', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.DIGIT_9)
            .shiftKey(true)
            .build()
        handler.updateStatus(status, event)
        const result = handler.updateStatus(status, event)
        const newStatus = result?.newStatus as Status
        const event2 = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.DIGIT_0)
            .shiftKey(true)
            .build()
        const result2 = handler.updateStatus(newStatus, event2)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.text.length).toBe(2)
        expect(txtStatus?.endOffset).toBe(2)
        expect(txtStatus?.startOffset).toBe(2)
    })
    it('just move cursor when the next char is "', (): void => {
        const event = new EditorKeyboardEventBuilder()
            .shiftKey(true)
            .code(KeyboardEventCode.QUOTE)
            .build()
        handler.updateStatus(status, event)
        const result = handler.updateStatus(status, event)
        const newStatus = result?.newStatus as Status
        const event2 = new EditorKeyboardEventBuilder()
            .code(KeyboardEventCode.QUOTE)
            .shiftKey(true)
            .build()
        const result2 = handler.updateStatus(newStatus, event2)
        const txtStatus = result2?.newStatus.textStatus
        expect(txtStatus).toBeDefined()
        expect(txtStatus?.text.length).toBe(2)
        expect(txtStatus?.endOffset).toBe(2)
        expect(txtStatus?.startOffset).toBe(2)
    })
// tslint:disable-next-line: max-file-line-count
})
