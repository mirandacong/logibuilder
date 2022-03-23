import {KeyCodeId} from './id'
import {KeyboardEventKeyCode} from './impl'
import {isFirefox, isMac, isWebkit} from './utils'

const ID_KEYCODE_MAP = new Map<KeyCodeId, KeyboardEventKeyCode>([
    [KeyCodeId.BACKSPACE, KeyboardEventKeyCode.BACK_SPACE],
    [KeyCodeId.TAB, KeyboardEventKeyCode.TAB],
    [KeyCodeId.ENTER, KeyboardEventKeyCode.ENTER],
    [KeyCodeId.LEFTSHIFT, KeyboardEventKeyCode.SHIFT],
    [KeyCodeId.RIGHTSHIFT, KeyboardEventKeyCode.SHIFT],
    [KeyCodeId.LEFTCTRL, KeyboardEventKeyCode.CONTROL],
    [KeyCodeId.RIGHTCTRL, KeyboardEventKeyCode.CONTROL],
    [KeyCodeId.RIGHTALT, KeyboardEventKeyCode.ALT],
    [KeyCodeId.LEFTALT, KeyboardEventKeyCode.ALT],

    [KeyCodeId.PAUSEBREAK, KeyboardEventKeyCode.PAUSE],

    [KeyCodeId.CAPSLOCK, KeyboardEventKeyCode.CAPS_LOCK],
    [KeyCodeId.ESCAPE, KeyboardEventKeyCode.ESCAPE],
    [KeyCodeId.SPACE, KeyboardEventKeyCode.SPACE],
    [KeyCodeId.PAGEUP, KeyboardEventKeyCode.PAGEUP],
    [KeyCodeId.PAGEDOWN, KeyboardEventKeyCode.PAGEDOWN],
    [KeyCodeId.END, KeyboardEventKeyCode.END],
    [KeyCodeId.HOME, KeyboardEventKeyCode.HOME],
    [KeyCodeId.LEFTARROW, KeyboardEventKeyCode.LEFTARROW],
    [KeyCodeId.UPARROW, KeyboardEventKeyCode.UPARROW],
    [KeyCodeId.RIGHTARROW, KeyboardEventKeyCode.RIGHTARROW],
    [KeyCodeId.DOWNARROW, KeyboardEventKeyCode.DOWNARROW],

    [KeyCodeId.INSERT, KeyboardEventKeyCode.PC_INSERT],
    [KeyCodeId.DELETE, KeyboardEventKeyCode.DELETE],

    [KeyCodeId.KEY_0, KeyboardEventKeyCode.DIGIT_0],
    [KeyCodeId.KEY_1, KeyboardEventKeyCode.DIGIT_1],
    [KeyCodeId.KEY_2, KeyboardEventKeyCode.DIGIT_2],
    [KeyCodeId.KEY_3, KeyboardEventKeyCode.DIGIT_3],
    [KeyCodeId.KEY_4, KeyboardEventKeyCode.DIGIT_4],
    [KeyCodeId.KEY_5, KeyboardEventKeyCode.DIGIT_5],
    [KeyCodeId.KEY_6, KeyboardEventKeyCode.DIGIT_6],
    [KeyCodeId.KEY_7, KeyboardEventKeyCode.DIGIT_7],
    [KeyCodeId.KEY_8, KeyboardEventKeyCode.DIGIT_8],
    [KeyCodeId.KEY_9, KeyboardEventKeyCode.DIGIT_9],

    [KeyCodeId.KEY_A, KeyboardEventKeyCode.KEY_A],
    [KeyCodeId.KEY_B, KeyboardEventKeyCode.KEY_B],
    [KeyCodeId.KEY_C, KeyboardEventKeyCode.KEY_C],
    [KeyCodeId.KEY_D, KeyboardEventKeyCode.KEY_D],
    [KeyCodeId.KEY_E, KeyboardEventKeyCode.KEY_E],
    [KeyCodeId.KEY_F, KeyboardEventKeyCode.KEY_F],
    [KeyCodeId.KEY_G, KeyboardEventKeyCode.KEY_G],
    [KeyCodeId.KEY_H, KeyboardEventKeyCode.KEY_H],
    [KeyCodeId.KEY_I, KeyboardEventKeyCode.KEY_I],
    [KeyCodeId.KEY_J, KeyboardEventKeyCode.KEY_J],
    [KeyCodeId.KEY_K, KeyboardEventKeyCode.KEY_K],
    [KeyCodeId.KEY_L, KeyboardEventKeyCode.KEY_L],
    [KeyCodeId.KEY_M, KeyboardEventKeyCode.KEY_M],
    [KeyCodeId.KEY_N, KeyboardEventKeyCode.KEY_N],
    [KeyCodeId.KEY_O, KeyboardEventKeyCode.KEY_O],
    [KeyCodeId.KEY_P, KeyboardEventKeyCode.KEY_P],
    [KeyCodeId.KEY_Q, KeyboardEventKeyCode.KEY_Q],
    [KeyCodeId.KEY_R, KeyboardEventKeyCode.KEY_R],
    [KeyCodeId.KEY_S, KeyboardEventKeyCode.KEY_S],
    [KeyCodeId.KEY_T, KeyboardEventKeyCode.KEY_T],
    [KeyCodeId.KEY_U, KeyboardEventKeyCode.KEY_U],
    [KeyCodeId.KEY_V, KeyboardEventKeyCode.KEY_V],
    [KeyCodeId.KEY_W, KeyboardEventKeyCode.KEY_W],
    [KeyCodeId.KEY_X, KeyboardEventKeyCode.KEY_X],
    [KeyCodeId.KEY_Y, KeyboardEventKeyCode.KEY_Y],
    [KeyCodeId.KEY_Z, KeyboardEventKeyCode.KEY_Z],

    [KeyCodeId.CONTEXTMENU, KeyboardEventKeyCode.CONTEXT_MENU],

    [KeyCodeId.NUMPAD_0, KeyboardEventKeyCode.NUMPAD0],
    [KeyCodeId.NUMPAD_1, KeyboardEventKeyCode.NUMPAD1],
    [KeyCodeId.NUMPAD_2, KeyboardEventKeyCode.NUMPAD2],
    [KeyCodeId.NUMPAD_3, KeyboardEventKeyCode.NUMPAD3],
    [KeyCodeId.NUMPAD_4, KeyboardEventKeyCode.NUMPAD4],
    [KeyCodeId.NUMPAD_5, KeyboardEventKeyCode.NUMPAD5],
    [KeyCodeId.NUMPAD_6, KeyboardEventKeyCode.NUMPAD6],
    [KeyCodeId.NUMPAD_7, KeyboardEventKeyCode.NUMPAD7],
    [KeyCodeId.NUMPAD_8, KeyboardEventKeyCode.NUMPAD8],
    [KeyCodeId.NUMPAD_9, KeyboardEventKeyCode.NUMPAD9],

    [KeyCodeId.NUMPAD_MULTIPLY, KeyboardEventKeyCode.NUMPAD_MULTIPLY],
    [KeyCodeId.NUMPAD_ADD, KeyboardEventKeyCode.NUMPAD_ADD],
    [KeyCodeId.NUMPAD_SEPARATOR, KeyboardEventKeyCode.SEPARATOR],
    [KeyCodeId.NUMPAD_SUBTRACT, KeyboardEventKeyCode.NUMPAD_SUBTRACT],
    [KeyCodeId.NUMPAD_DECIMAL, KeyboardEventKeyCode.NUMPAD_DECIMAL],
    [KeyCodeId.NUMPAD_DIVIDE, KeyboardEventKeyCode.NUMPAD_DIVIDE],

    [KeyCodeId.F1, KeyboardEventKeyCode.F1],
    [KeyCodeId.F2, KeyboardEventKeyCode.F2],
    [KeyCodeId.F3, KeyboardEventKeyCode.F3],
    [KeyCodeId.F4, KeyboardEventKeyCode.F4],
    [KeyCodeId.F5, KeyboardEventKeyCode.F5],
    [KeyCodeId.F6, KeyboardEventKeyCode.F6],
    [KeyCodeId.F7, KeyboardEventKeyCode.F7],
    [KeyCodeId.F8, KeyboardEventKeyCode.F8],
    [KeyCodeId.F9, KeyboardEventKeyCode.F9],
    [KeyCodeId.F10, KeyboardEventKeyCode.F10],
    [KeyCodeId.F11, KeyboardEventKeyCode.F11],
    [KeyCodeId.F12, KeyboardEventKeyCode.F12],
    [KeyCodeId.F13, KeyboardEventKeyCode.F13],
    [KeyCodeId.F14, KeyboardEventKeyCode.F14],
    [KeyCodeId.F15, KeyboardEventKeyCode.F15],

    [KeyCodeId.NUMLOCK, KeyboardEventKeyCode.NUM_LOCK],
    [KeyCodeId.SCROLLLOCK, KeyboardEventKeyCode.SCROLL_LOCK],

    [KeyCodeId.US_SEMICOLON, KeyboardEventKeyCode.SEMICOLON],
    [KeyCodeId.US_EQUAL, KeyboardEventKeyCode.EQUAL],
    [KeyCodeId.US_COMMA, KeyboardEventKeyCode.COMMA],
    [KeyCodeId.US_MINUS, KeyboardEventKeyCode.MINUS],
    [KeyCodeId.US_DOT, KeyboardEventKeyCode.PERIOD],
    [KeyCodeId.US_SLASH, KeyboardEventKeyCode.SLASH],
    [KeyCodeId.US_BACKTICK, KeyboardEventKeyCode.BACKQUOTE],
    [KeyCodeId.ABNT_C1, KeyboardEventKeyCode.IE_WIN_INTLRO],
    [KeyCodeId.ABNT_C2, KeyboardEventKeyCode.NUMPAD_COMMA],

    [KeyCodeId.US_OPEN_SQUARE_BRACKET, KeyboardEventKeyCode.BRACKETLEFT],
    [KeyCodeId.US_BACKSLASH, KeyboardEventKeyCode.BACKSLASH],
    [KeyCodeId.US_CLOSE_SQUARE_BRACKET, KeyboardEventKeyCode.BRACKETRIGHT],
    [KeyCodeId.US_QUOTE, KeyboardEventKeyCode.QUOTE],
    /**
     * do not contain OEM_8
     * because do not have a standard board.code or keycode value
     */

    [KeyCodeId.KEY_IN_COMPOSITION, KeyboardEventKeyCode.KEY_IN_COMPOSITION],
])

// tslint:disable-next-line: cyclomatic-complexity
export function getKeyCodeForId(keyCode: KeyCodeId): KeyboardEventKeyCode {
    if (isFirefox()) {
        if (keyCode === KeyCodeId.US_SEMICOLON)
            return KeyboardEventKeyCode.FF_SEMICOLON
        if (keyCode === KeyCodeId.US_EQUAL)
            return KeyboardEventKeyCode.FF_EQUAL
        if (keyCode === KeyCodeId.US_MINUS)
            return KeyboardEventKeyCode.NUMPAD_SUBTRACT
        if (isMac() && keyCode === KeyCodeId.RIGHTMETA)
            return KeyboardEventKeyCode.META
    } else if (isWebkit()) {
        if (isMac()) {
            if (keyCode === KeyCodeId.RIGHTMETA)
                return KeyboardEventKeyCode.MAC_OSRIGHT
            if (keyCode === KeyCodeId.LEFTMETA)
                return KeyboardEventKeyCode.OSLEFT
        }
        if (keyCode === KeyCodeId.RIGHTMETA)
            return KeyboardEventKeyCode.MAC_META
        if (keyCode === KeyCodeId.LEFTMETA)
            return KeyboardEventKeyCode.OSLEFT
    }

    if (keyCode === KeyCodeId.SCROLLLOCK && isMac())
        return KeyboardEventKeyCode.F14

    if (keyCode === KeyCodeId.NUMLOCK && isMac())
        return KeyboardEventKeyCode.CLEAR

    if (keyCode === KeyCodeId.CONTEXTMENU && isMac())
        return KeyboardEventKeyCode.UNKNOWN

    const id = ID_KEYCODE_MAP.get(keyCode)
    if (id === undefined)
        return KeyboardEventKeyCode.UNKNOWN
    return id
}
