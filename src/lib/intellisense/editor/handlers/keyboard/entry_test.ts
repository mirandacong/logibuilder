import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {
    EditorKeyboardEventBuilder,
} from '@logi/src/lib/intellisense/editor/events'

import {buildKeyEvent} from './entry'

describe('key handler', (): void => {
    it('build key event', (): void => {
        const ctrlA = buildKeyEvent('Ctrl+KeyA')
        const actual = new EditorKeyboardEventBuilder()
            .ctrlKey(true)
            .code(KeyboardEventCode.KEY_A)
            .build()
        expect(actual.typeEqual(ctrlA)).toBe(true)
        const shiftBra = buildKeyEvent('Shift+BracketLeft')
        const actual2 = new EditorKeyboardEventBuilder()
            .shiftKey(true)
            .code(KeyboardEventCode.BRACKET_LEFT)
            .build()
        expect(actual2.typeEqual(shiftBra)).toBe(true)
    })
})
