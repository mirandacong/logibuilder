import {KeyCodeId} from './id'
import {KeyboardEventCode} from './impl'

const ID_CODE_MAP = new Map<KeyCodeId, KeyboardEventCode>([
    [KeyCodeId.BACKSPACE, KeyboardEventCode.BACKSPACE],
    [KeyCodeId.TAB, KeyboardEventCode.TAB],
    [KeyCodeId.ENTER, KeyboardEventCode.ENTER],
    [KeyCodeId.RIGHTSHIFT, KeyboardEventCode.SHIFT_RIGHT],
    [KeyCodeId.LEFTSHIFT, KeyboardEventCode.SHIFT_LEFT],
    [KeyCodeId.LEFTCTRL, KeyboardEventCode.CONTROL_LEFT],
    [KeyCodeId.RIGHTCTRL, KeyboardEventCode.CONTROL_RIGHT],
    [KeyCodeId.RIGHTALT, KeyboardEventCode.ALT_RIGHT],
    [KeyCodeId.LEFTALT, KeyboardEventCode.ALT_LEFT],

    [KeyCodeId.PAUSEBREAK, KeyboardEventCode.PAUSE],

    [KeyCodeId.CAPSLOCK, KeyboardEventCode.CAPS_LOCK],

    [KeyCodeId.ESCAPE, KeyboardEventCode.ESCAPE],

    [KeyCodeId.SPACE, KeyboardEventCode.SPACE],
    [KeyCodeId.PAGEUP, KeyboardEventCode.PAGE_UP],
    [KeyCodeId.PAGEDOWN, KeyboardEventCode.PAGE_DOWN],
    [KeyCodeId.END, KeyboardEventCode.END],
    [KeyCodeId.HOME, KeyboardEventCode.HOME],
    [KeyCodeId.LEFTARROW, KeyboardEventCode.ARROW_LEFT],
    [KeyCodeId.UPARROW, KeyboardEventCode.ARROW_UP],
    [KeyCodeId.RIGHTARROW, KeyboardEventCode.ARROW_RIGHT],
    [KeyCodeId.DOWNARROW, KeyboardEventCode.ARROW_DOWN],

    [KeyCodeId.INSERT, KeyboardEventCode.INSERT],
    [KeyCodeId.DELETE, KeyboardEventCode.DELETE],

    [KeyCodeId.KEY_0, KeyboardEventCode.DIGIT_0],
    [KeyCodeId.KEY_1, KeyboardEventCode.DIGIT_1],
    [KeyCodeId.KEY_2, KeyboardEventCode.DIGIT_2],
    [KeyCodeId.KEY_3, KeyboardEventCode.DIGIT_3],
    [KeyCodeId.KEY_4, KeyboardEventCode.DIGIT_4],
    [KeyCodeId.KEY_5, KeyboardEventCode.DIGIT_5],
    [KeyCodeId.KEY_6, KeyboardEventCode.DIGIT_6],
    [KeyCodeId.KEY_7, KeyboardEventCode.DIGIT_7],
    [KeyCodeId.KEY_8, KeyboardEventCode.DIGIT_8],
    [KeyCodeId.KEY_9, KeyboardEventCode.DIGIT_9],

    [KeyCodeId.KEY_A, KeyboardEventCode.KEY_A],
    [KeyCodeId.KEY_B, KeyboardEventCode.KEY_B],
    [KeyCodeId.KEY_C, KeyboardEventCode.KEY_C],
    [KeyCodeId.KEY_D, KeyboardEventCode.KEY_D],
    [KeyCodeId.KEY_E, KeyboardEventCode.KEY_E],
    [KeyCodeId.KEY_F, KeyboardEventCode.KEY_F],
    [KeyCodeId.KEY_G, KeyboardEventCode.KEY_G],
    [KeyCodeId.KEY_H, KeyboardEventCode.KEY_H],
    [KeyCodeId.KEY_I, KeyboardEventCode.KEY_I],
    [KeyCodeId.KEY_J, KeyboardEventCode.KEY_J],
    [KeyCodeId.KEY_K, KeyboardEventCode.KEY_K],
    [KeyCodeId.KEY_L, KeyboardEventCode.KEY_L],
    [KeyCodeId.KEY_M, KeyboardEventCode.KEY_M],
    [KeyCodeId.KEY_N, KeyboardEventCode.KEY_N],
    [KeyCodeId.KEY_O, KeyboardEventCode.KEY_O],
    [KeyCodeId.KEY_P, KeyboardEventCode.KEY_P],
    [KeyCodeId.KEY_Q, KeyboardEventCode.KEY_Q],
    [KeyCodeId.KEY_R, KeyboardEventCode.KEY_R],
    [KeyCodeId.KEY_S, KeyboardEventCode.KEY_S],
    [KeyCodeId.KEY_T, KeyboardEventCode.KEY_T],
    [KeyCodeId.KEY_U, KeyboardEventCode.KEY_U],
    [KeyCodeId.KEY_V, KeyboardEventCode.KEY_V],
    [KeyCodeId.KEY_W, KeyboardEventCode.KEY_W],
    [KeyCodeId.KEY_X, KeyboardEventCode.KEY_X],
    [KeyCodeId.KEY_Y, KeyboardEventCode.KEY_Y],
    [KeyCodeId.KEY_Z, KeyboardEventCode.KEY_Z],

    [KeyCodeId.LEFTMETA, KeyboardEventCode.METALEFT],
    [KeyCodeId.RIGHTMETA, KeyboardEventCode.META_RIGHT],

    [KeyCodeId.CONTEXTMENU, KeyboardEventCode.CONTENT_MENU],
    [KeyCodeId.F1, KeyboardEventCode.F1],
    [KeyCodeId.F2, KeyboardEventCode.F2],
    [KeyCodeId.F3, KeyboardEventCode.F3],
    [KeyCodeId.F4, KeyboardEventCode.F4],
    [KeyCodeId.F5, KeyboardEventCode.F5],
    [KeyCodeId.F6, KeyboardEventCode.F6],
    [KeyCodeId.F7, KeyboardEventCode.F7],
    [KeyCodeId.F8, KeyboardEventCode.F8],
    [KeyCodeId.F9, KeyboardEventCode.F9],
    [KeyCodeId.F10, KeyboardEventCode.F10],
    [KeyCodeId.F11, KeyboardEventCode.F11],
    [KeyCodeId.F12, KeyboardEventCode.F12],

    [KeyCodeId.NUMLOCK, KeyboardEventCode.NUMPAD_CLEAR],
    [KeyCodeId.SCROLLLOCK, KeyboardEventCode.SCROLL_LOCK],

    [KeyCodeId.US_SEMICOLON, KeyboardEventCode.SEMICOLON],
    [KeyCodeId.US_EQUAL, KeyboardEventCode.EQUAL],
    [KeyCodeId.US_COMMA, KeyboardEventCode.COMMA],
    [KeyCodeId.US_MINUS, KeyboardEventCode.MINUS],
    [KeyCodeId.US_SLASH, KeyboardEventCode.SLASH],

    [KeyCodeId.US_OPEN_SQUARE_BRACKET, KeyboardEventCode.BRACKET_LEFT],
    [KeyCodeId.US_BACKSLASH, KeyboardEventCode.BACKSLASH],
    [KeyCodeId.US_CLOSE_SQUARE_BRACKET, KeyboardEventCode.BRACKET_RIGHT],
    [KeyCodeId.US_QUOTE, KeyboardEventCode.QUOTE],

    [KeyCodeId.US_BACKTICK, KeyboardEventCode.BACKQUOTE],

    [KeyCodeId.ABNT_C1, KeyboardEventCode.INTL_RO],
    [KeyCodeId.ABNT_C2, KeyboardEventCode.NUMPAD_COMMA],

    [KeyCodeId.NUMPAD_0, KeyboardEventCode.NUMPAD_0],
    [KeyCodeId.NUMPAD_1, KeyboardEventCode.NUMPAD_1],
    [KeyCodeId.NUMPAD_2, KeyboardEventCode.NUMPAD_2],
    [KeyCodeId.NUMPAD_3, KeyboardEventCode.NUMPAD_3],
    [KeyCodeId.NUMPAD_4, KeyboardEventCode.NUMPAD_4],
    [KeyCodeId.NUMPAD_5, KeyboardEventCode.NUMPAD_5],
    [KeyCodeId.NUMPAD_6, KeyboardEventCode.NUMPAD_6],
    [KeyCodeId.NUMPAD_7, KeyboardEventCode.NUMPAD_7],
    [KeyCodeId.NUMPAD_8, KeyboardEventCode.NUMPAD_8],
    [KeyCodeId.NUMPAD_9, KeyboardEventCode.NUMPAD_9],

    [KeyCodeId.NUMPAD_MULTIPLY, KeyboardEventCode.NUMPAD_MULTIPLY],
    [KeyCodeId.NUMPAD_ADD, KeyboardEventCode.NUMPAD_ADD],
    [KeyCodeId.NUMPAD_SUBTRACT, KeyboardEventCode.NUMPAD_SUBTRACT],
    [KeyCodeId.NUMPAD_DECIMAL, KeyboardEventCode.NUMPAD_DECIMAL],
    [KeyCodeId.NUMPAD_DIVIDE, KeyboardEventCode.NUMPAD_DIVIDE],

    [KeyCodeId.NUMPAD_EQUAL, KeyboardEventCode.NUMPAD_EQUAL],
])

export function getCodeForId(code: KeyCodeId): KeyboardEventCode {
    const id = ID_CODE_MAP.get(code)
    if (id === undefined)
        return KeyboardEventCode.UNKNOWN
    return id
}

const CODE_ID_MAP = new Map<KeyboardEventCode, KeyCodeId>([
    [KeyboardEventCode.BACKSPACE, KeyCodeId.BACKSPACE],
    [KeyboardEventCode.TAB, KeyCodeId.TAB],
    [KeyboardEventCode.ENTER, KeyCodeId.ENTER],
    [KeyboardEventCode.SHIFT_RIGHT, KeyCodeId.RIGHTSHIFT],
    [KeyboardEventCode.SHIFT_LEFT, KeyCodeId.LEFTSHIFT],
    [KeyboardEventCode.CONTROL_LEFT, KeyCodeId.LEFTCTRL],
    [KeyboardEventCode.CONTROL_RIGHT, KeyCodeId.RIGHTCTRL],
    [KeyboardEventCode.ALT_RIGHT, KeyCodeId.RIGHTALT],
    [KeyboardEventCode.ALT_LEFT, KeyCodeId.LEFTALT],

    [KeyboardEventCode.PAUSE, KeyCodeId.PAUSEBREAK],

    [KeyboardEventCode.CAPS_LOCK, KeyCodeId.CAPSLOCK],

    [KeyboardEventCode.ESCAPE, KeyCodeId.ESCAPE],

    [KeyboardEventCode.SPACE, KeyCodeId.SPACE],
    [KeyboardEventCode.PAGE_UP, KeyCodeId.PAGEUP],
    [KeyboardEventCode.PAGE_DOWN, KeyCodeId.PAGEDOWN],
    [KeyboardEventCode.END, KeyCodeId.END],
    [KeyboardEventCode.HOME, KeyCodeId.HOME],
    [KeyboardEventCode.ARROW_LEFT, KeyCodeId.LEFTARROW],
    [KeyboardEventCode.ARROW_UP, KeyCodeId.UPARROW],
    [KeyboardEventCode.ARROW_RIGHT, KeyCodeId.RIGHTARROW],
    [KeyboardEventCode.ARROW_DOWN, KeyCodeId.DOWNARROW],

    [KeyboardEventCode.INSERT, KeyCodeId.INSERT],
    [KeyboardEventCode.DELETE, KeyCodeId.DELETE],

    [KeyboardEventCode.DIGIT_0, KeyCodeId.KEY_0],
    [KeyboardEventCode.DIGIT_1, KeyCodeId.KEY_1],
    [KeyboardEventCode.DIGIT_2, KeyCodeId.KEY_2],
    [KeyboardEventCode.DIGIT_3, KeyCodeId.KEY_3],
    [KeyboardEventCode.DIGIT_4, KeyCodeId.KEY_4],
    [KeyboardEventCode.DIGIT_5, KeyCodeId.KEY_5],
    [KeyboardEventCode.DIGIT_6, KeyCodeId.KEY_6],
    [KeyboardEventCode.DIGIT_7, KeyCodeId.KEY_7],
    [KeyboardEventCode.DIGIT_8, KeyCodeId.KEY_8],
    [KeyboardEventCode.DIGIT_9, KeyCodeId.KEY_9],

    [KeyboardEventCode.KEY_A, KeyCodeId.KEY_A],
    [KeyboardEventCode.KEY_B, KeyCodeId.KEY_B],
    [KeyboardEventCode.KEY_C, KeyCodeId.KEY_C],
    [KeyboardEventCode.KEY_D, KeyCodeId.KEY_D],
    [KeyboardEventCode.KEY_E, KeyCodeId.KEY_E],
    [KeyboardEventCode.KEY_F, KeyCodeId.KEY_F],
    [KeyboardEventCode.KEY_G, KeyCodeId.KEY_G],
    [KeyboardEventCode.KEY_H, KeyCodeId.KEY_H],
    [KeyboardEventCode.KEY_I, KeyCodeId.KEY_I],
    [KeyboardEventCode.KEY_J, KeyCodeId.KEY_J],
    [KeyboardEventCode.KEY_K, KeyCodeId.KEY_K],
    [KeyboardEventCode.KEY_L, KeyCodeId.KEY_L],
    [KeyboardEventCode.KEY_M, KeyCodeId.KEY_M],
    [KeyboardEventCode.KEY_N, KeyCodeId.KEY_N],
    [KeyboardEventCode.KEY_O, KeyCodeId.KEY_O],
    [KeyboardEventCode.KEY_P, KeyCodeId.KEY_P],
    [KeyboardEventCode.KEY_Q, KeyCodeId.KEY_O],
    [KeyboardEventCode.KEY_R, KeyCodeId.KEY_R],
    [KeyboardEventCode.KEY_S, KeyCodeId.KEY_S],
    [KeyboardEventCode.KEY_T, KeyCodeId.KEY_T],
    [KeyboardEventCode.KEY_U, KeyCodeId.KEY_U],
    [KeyboardEventCode.KEY_V, KeyCodeId.KEY_V],
    [KeyboardEventCode.KEY_W, KeyCodeId.KEY_W],
    [KeyboardEventCode.KEY_X, KeyCodeId.KEY_X],
    [KeyboardEventCode.KEY_Y, KeyCodeId.KEY_Y],
    [KeyboardEventCode.KEY_Z, KeyCodeId.KEY_Z],

    [KeyboardEventCode.METALEFT, KeyCodeId.LEFTMETA],
    [KeyboardEventCode.META_RIGHT, KeyCodeId.RIGHTMETA],

    [KeyboardEventCode.CONTENT_MENU, KeyCodeId.CONTEXTMENU],
    [KeyboardEventCode.F1, KeyCodeId.F1],
    [KeyboardEventCode.F2, KeyCodeId.F2],
    [KeyboardEventCode.F3, KeyCodeId.F3],
    [KeyboardEventCode.F4, KeyCodeId.F4],
    [KeyboardEventCode.F5, KeyCodeId.F5],
    [KeyboardEventCode.F6, KeyCodeId.F6],
    [KeyboardEventCode.F7, KeyCodeId.F7],
    [KeyboardEventCode.F8, KeyCodeId.F8],
    [KeyboardEventCode.F9, KeyCodeId.F9],
    [KeyboardEventCode.F10, KeyCodeId.F10],
    [KeyboardEventCode.F11, KeyCodeId.F11],
    [KeyboardEventCode.F12, KeyCodeId.F12],

    [KeyboardEventCode.NUMPAD_CLEAR, KeyCodeId.NUMLOCK],
    [KeyboardEventCode.SCROLL_LOCK, KeyCodeId.SCROLLLOCK],

    [KeyboardEventCode.SEMICOLON, KeyCodeId.US_SEMICOLON],
    [KeyboardEventCode.EQUAL, KeyCodeId.US_EQUAL],
    [KeyboardEventCode.COMMA, KeyCodeId.US_COMMA],
    [KeyboardEventCode.MINUS, KeyCodeId.US_MINUS],
    [KeyboardEventCode.SLASH, KeyCodeId.US_SLASH],

    [KeyboardEventCode.BRACKET_LEFT, KeyCodeId.US_OPEN_SQUARE_BRACKET],
    [KeyboardEventCode.BACKSLASH, KeyCodeId.US_BACKSLASH],
    [KeyboardEventCode.BRACKET_RIGHT, KeyCodeId.US_CLOSE_SQUARE_BRACKET],
    [KeyboardEventCode.QUOTE, KeyCodeId.US_QUOTE],

    [KeyboardEventCode.BACKQUOTE, KeyCodeId.US_BACKTICK],

    [KeyboardEventCode.INTL_RO, KeyCodeId.ABNT_C1],
    [KeyboardEventCode.NUMPAD_COMMA, KeyCodeId.ABNT_C2],

    [KeyboardEventCode.NUMPAD_0, KeyCodeId.NUMPAD_0],
    [KeyboardEventCode.NUMPAD_1, KeyCodeId.NUMPAD_1],
    [KeyboardEventCode.NUMPAD_2, KeyCodeId.NUMPAD_2],
    [KeyboardEventCode.NUMPAD_3, KeyCodeId.NUMPAD_3],
    [KeyboardEventCode.NUMPAD_4, KeyCodeId.NUMPAD_4],
    [KeyboardEventCode.NUMPAD_5, KeyCodeId.NUMPAD_5],
    [KeyboardEventCode.NUMPAD_6, KeyCodeId.NUMPAD_6],
    [KeyboardEventCode.NUMPAD_7, KeyCodeId.NUMPAD_7],
    [KeyboardEventCode.NUMPAD_8, KeyCodeId.NUMPAD_8],
    [KeyboardEventCode.NUMPAD_9, KeyCodeId.NUMPAD_9],

    [KeyboardEventCode.NUMPAD_MULTIPLY, KeyCodeId.NUMPAD_MULTIPLY],
    [KeyboardEventCode.NUMPAD_ADD, KeyCodeId.NUMPAD_ADD],
    [KeyboardEventCode.NUMPAD_SUBTRACT, KeyCodeId.NUMPAD_SUBTRACT],
    [KeyboardEventCode.NUMPAD_DECIMAL, KeyCodeId.NUMPAD_DECIMAL],
    [KeyboardEventCode.NUMPAD_DIVIDE, KeyCodeId.NUMPAD_DIVIDE],

    [KeyboardEventCode.NUMPAD_EQUAL, KeyCodeId.NUMPAD_EQUAL],
])

export function getIdForCode(code: KeyboardEventCode): KeyCodeId {
    const id = CODE_ID_MAP.get(code)
    if (id === undefined)
        return KeyCodeId.UNKNOWN
    return id
}
