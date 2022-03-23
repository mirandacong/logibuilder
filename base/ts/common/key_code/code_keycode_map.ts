import {KeyboardEventCode, KeyboardEventKeyCode} from './impl'
import {isChrome, isFirefox, isLinux, isMac, isWindows} from './utils'

const CODE_KEYCODE_MAP =
new Map<KeyboardEventCode, KeyboardEventKeyCode>([
    [KeyboardEventCode.BACKQUOTE, KeyboardEventKeyCode.BACKQUOTE],
    [KeyboardEventCode.BACKSLASH, KeyboardEventKeyCode.BACKSLASH],
    [KeyboardEventCode.BACKSPACE, KeyboardEventKeyCode.BACK_SPACE],
    [KeyboardEventCode.BRACKET_LEFT, KeyboardEventKeyCode.BRACKETLEFT],
    [KeyboardEventCode.BRACKET_RIGHT, KeyboardEventKeyCode.BRACKETRIGHT],
    [KeyboardEventCode.COMMA, KeyboardEventKeyCode.COMMA],
    [KeyboardEventCode.DIGIT_0, KeyboardEventKeyCode.NUMPAD0],
    [KeyboardEventCode.DIGIT_1, KeyboardEventKeyCode.NUMPAD1],
    [KeyboardEventCode.DIGIT_2, KeyboardEventKeyCode.NUMPAD2],
    [KeyboardEventCode.DIGIT_3, KeyboardEventKeyCode.NUMPAD3],
    [KeyboardEventCode.DIGIT_4, KeyboardEventKeyCode.NUMPAD4],
    [KeyboardEventCode.DIGIT_5, KeyboardEventKeyCode.NUMPAD5],
    [KeyboardEventCode.DIGIT_6, KeyboardEventKeyCode.NUMPAD6],
    [KeyboardEventCode.DIGIT_7, KeyboardEventKeyCode.NUMPAD7],
    [KeyboardEventCode.DIGIT_8, KeyboardEventKeyCode.NUMPAD8],
    [KeyboardEventCode.DIGIT_9, KeyboardEventKeyCode.NUMPAD9],
    [KeyboardEventCode.EQUAL, KeyboardEventKeyCode.EQUAL],
    [KeyboardEventCode.INTL_BACKSLASH, KeyboardEventKeyCode.BACKSLASH],
    [KeyboardEventCode.KEY_A, KeyboardEventKeyCode.KEY_A],
    [KeyboardEventCode.KEY_B, KeyboardEventKeyCode.KEY_B],
    [KeyboardEventCode.KEY_C, KeyboardEventKeyCode.KEY_C],
    [KeyboardEventCode.KEY_D, KeyboardEventKeyCode.KEY_D],
    [KeyboardEventCode.KEY_E, KeyboardEventKeyCode.KEY_E],
    [KeyboardEventCode.KEY_F, KeyboardEventKeyCode.KEY_F],
    [KeyboardEventCode.KEY_G, KeyboardEventKeyCode.KEY_G],
    [KeyboardEventCode.KEY_H, KeyboardEventKeyCode.KEY_H],
    [KeyboardEventCode.KEY_I, KeyboardEventKeyCode.KEY_I],
    [KeyboardEventCode.KEY_J, KeyboardEventKeyCode.KEY_J],
    [KeyboardEventCode.KEY_K, KeyboardEventKeyCode.KEY_K],
    [KeyboardEventCode.KEY_L, KeyboardEventKeyCode.KEY_L],
    [KeyboardEventCode.KEY_M, KeyboardEventKeyCode.KEY_M],
    [KeyboardEventCode.KEY_N, KeyboardEventKeyCode.KEY_N],
    [KeyboardEventCode.KEY_O, KeyboardEventKeyCode.KEY_O],
    [KeyboardEventCode.KEY_P, KeyboardEventKeyCode.KEY_P],
    [KeyboardEventCode.KEY_Q, KeyboardEventKeyCode.KEY_Q],
    [KeyboardEventCode.KEY_R, KeyboardEventKeyCode.KEY_R],
    [KeyboardEventCode.KEY_S, KeyboardEventKeyCode.KEY_S],
    [KeyboardEventCode.KEY_T, KeyboardEventKeyCode.KEY_T],
    [KeyboardEventCode.KEY_U, KeyboardEventKeyCode.KEY_U],
    [KeyboardEventCode.KEY_V, KeyboardEventKeyCode.KEY_V],
    [KeyboardEventCode.KEY_W, KeyboardEventKeyCode.KEY_W],
    [KeyboardEventCode.KEY_X, KeyboardEventKeyCode.KEY_X],
    [KeyboardEventCode.KEY_Y, KeyboardEventKeyCode.KEY_Y],
    [KeyboardEventCode.KEY_Z, KeyboardEventKeyCode.KEY_Z],
    [KeyboardEventCode.MINUS, KeyboardEventKeyCode.MINUS],
    [KeyboardEventCode.PERIOD, KeyboardEventKeyCode.PERIOD],
    [KeyboardEventCode.QUOTE, KeyboardEventKeyCode.QUOTE],
    [KeyboardEventCode.SEMICOLON, KeyboardEventKeyCode.SEMICOLON],
    [KeyboardEventCode.SLASH, KeyboardEventKeyCode.SLASH],
    [KeyboardEventCode.ALT_LEFT, KeyboardEventKeyCode.ALT],
    [KeyboardEventCode.ALT_RIGHT, KeyboardEventKeyCode.ALT],
    [KeyboardEventCode.CAPS_LOCK, KeyboardEventKeyCode.CAPS_LOCK],
    [KeyboardEventCode.CONTENT_MENU, KeyboardEventKeyCode.CONTEXT_MENU],
    [KeyboardEventCode.CONTROL_LEFT, KeyboardEventKeyCode.CONTROL],
    [KeyboardEventCode.CONTROL_RIGHT, KeyboardEventKeyCode.CONTROL],
    [KeyboardEventCode.ENTER, KeyboardEventKeyCode.ENTER],
    [KeyboardEventCode.METALEFT, KeyboardEventKeyCode.OSLEFT],
    [KeyboardEventCode.META_RIGHT, KeyboardEventKeyCode.OSRIGHT],
    [KeyboardEventCode.SHIFT_LEFT, KeyboardEventKeyCode.SHIFT],
    [KeyboardEventCode.SHIFT_RIGHT, KeyboardEventKeyCode.SHIFT],
    [KeyboardEventCode.SPACE, KeyboardEventKeyCode.SPACE],
    [KeyboardEventCode.TAB, KeyboardEventKeyCode.TAB],
    [KeyboardEventCode.DELETE, KeyboardEventKeyCode.DELETE],
    [KeyboardEventCode.END, KeyboardEventKeyCode.END],
    [KeyboardEventCode.HELP, KeyboardEventKeyCode.PC_INSERT],
    [KeyboardEventCode.HOME, KeyboardEventKeyCode.HOME],
    [KeyboardEventCode.INSERT, KeyboardEventKeyCode.PC_INSERT],
    [KeyboardEventCode.PAGE_DOWN, KeyboardEventKeyCode.PAGEDOWN],
    [KeyboardEventCode.PAGE_UP, KeyboardEventKeyCode.PAGEUP],
    [KeyboardEventCode.ARROW_DOWN, KeyboardEventKeyCode.DOWNARROW],
    [KeyboardEventCode.ARROW_LEFT, KeyboardEventKeyCode.LEFTARROW],
    [KeyboardEventCode.ARROW_RIGHT, KeyboardEventKeyCode.RIGHTARROW],
    [KeyboardEventCode.ARROW_UP, KeyboardEventKeyCode.UPARROW],
    [KeyboardEventCode.NUM_LOCK, KeyboardEventKeyCode.NUM_LOCK],
    [KeyboardEventCode.NUMPAD_0, KeyboardEventKeyCode.DIGIT_0],
    [KeyboardEventCode.NUMPAD_1, KeyboardEventKeyCode.DIGIT_1],
    [KeyboardEventCode.NUMPAD_2, KeyboardEventKeyCode.DIGIT_2],
    [KeyboardEventCode.NUMPAD_3, KeyboardEventKeyCode.DIGIT_3],
    [KeyboardEventCode.NUMPAD_4, KeyboardEventKeyCode.DIGIT_4],
    [KeyboardEventCode.NUMPAD_5, KeyboardEventKeyCode.DIGIT_5],
    [KeyboardEventCode.NUMPAD_6, KeyboardEventKeyCode.DIGIT_6],
    [KeyboardEventCode.NUMPAD_7, KeyboardEventKeyCode.DIGIT_7],
    [KeyboardEventCode.NUMPAD_8, KeyboardEventKeyCode.DIGIT_8],
    [KeyboardEventCode.NUMPAD_9, KeyboardEventKeyCode.DIGIT_9],
    [KeyboardEventCode.NUMPAD_ADD, KeyboardEventKeyCode.NUMPAD_ADD],
    [KeyboardEventCode.NUMPAD_CLEAR, KeyboardEventKeyCode.CLEAR],
    [KeyboardEventCode.NUMPAD_CLEAR_ENTRY, KeyboardEventKeyCode.CLEAR],
    [KeyboardEventCode.NUMPAD_COMMA, KeyboardEventKeyCode.NUMPAD_COMMA],
    [KeyboardEventCode.NUMPAD_EQUAL, KeyboardEventKeyCode.CLEAR],
    [KeyboardEventCode.NUMPAD_DECIMAL, KeyboardEventKeyCode.NUMPAD_DECIMAL],
    [KeyboardEventCode.NUMPAD_DIVIDE, KeyboardEventKeyCode.NUMPAD_DIVIDE],
    [KeyboardEventCode.NUMPAD_ENTER, KeyboardEventKeyCode.ENTER],
    [KeyboardEventCode.NUMPAD_MULTIPLY, KeyboardEventKeyCode.NUMPAD_MULTIPLY],
    [KeyboardEventCode.NUMPAD_SUBTRACT, KeyboardEventKeyCode.NUMPAD_SUBTRACT],
    [KeyboardEventCode.ESCAPE, KeyboardEventKeyCode.ESCAPE],
    [KeyboardEventCode.F1, KeyboardEventKeyCode.F1],
    [KeyboardEventCode.F2, KeyboardEventKeyCode.F2],
    [KeyboardEventCode.F3, KeyboardEventKeyCode.F3],
    [KeyboardEventCode.F4, KeyboardEventKeyCode.F4],
    [KeyboardEventCode.F5, KeyboardEventKeyCode.F5],
    [KeyboardEventCode.F6, KeyboardEventKeyCode.F6],
    [KeyboardEventCode.F7, KeyboardEventKeyCode.F7],
    [KeyboardEventCode.F8, KeyboardEventKeyCode.F8],
    [KeyboardEventCode.F9, KeyboardEventKeyCode.F9],
    [KeyboardEventCode.F10, KeyboardEventKeyCode.F10],
    [KeyboardEventCode.F11, KeyboardEventKeyCode.F11],
    [KeyboardEventCode.F12, KeyboardEventKeyCode.F12],
    [KeyboardEventCode.F13, KeyboardEventKeyCode.F13],
    [KeyboardEventCode.F14, KeyboardEventKeyCode.F14],
    [KeyboardEventCode.F15, KeyboardEventKeyCode.F15],
    [KeyboardEventCode.INTL_YEN, KeyboardEventKeyCode.INTLYEN],
    [KeyboardEventCode.PRINT_SCREEN, KeyboardEventKeyCode.PRINTSCREEN],
    [KeyboardEventCode.SCROLL_LOCK, KeyboardEventKeyCode.SCROLL_LOCK],
    [KeyboardEventCode.PAUSE, KeyboardEventKeyCode.PAUSE],
])

export function isNumPad(code: string): boolean {
    const numpadCodes: readonly string[] = [
        KeyboardEventCode.NUMPAD_0,
        KeyboardEventCode.NUMPAD_1,
        KeyboardEventCode.NUMPAD_2,
        KeyboardEventCode.NUMPAD_3,
        KeyboardEventCode.NUMPAD_4,
        KeyboardEventCode.NUMPAD_5,
        KeyboardEventCode.NUMPAD_6,
        KeyboardEventCode.NUMPAD_7,
        KeyboardEventCode.NUMPAD_8,
        KeyboardEventCode.NUMPAD_9,
        KeyboardEventCode.NUMPAD_ADD,
        KeyboardEventCode.NUMPAD_CLEAR,
        KeyboardEventCode.NUMPAD_CLEAR_ENTRY,
        KeyboardEventCode.NUMPAD_COMMA,
        KeyboardEventCode.NUMPAD_EQUAL,
        KeyboardEventCode.NUMPAD_DECIMAL,
        KeyboardEventCode.NUMPAD_DIVIDE,
        KeyboardEventCode.NUMPAD_ENTER,
        KeyboardEventCode.NUMPAD_MULTIPLY,
        KeyboardEventCode.NUMPAD_SUBTRACT,
    ]
    return numpadCodes.includes(code)
}

/**
 * Some keycodes have different values in different browsers
 * such as SEMICOLON, EQUAL, MINUS
 * @param code KeyBoardEvent.code
 */
// tslint:disable-next-line: cyclomatic-complexity max-func-body-length
export function getKeyCodeForCode(code: KeyboardEventCode): number {
    if ((code === KeyboardEventCode.SEMICOLON) && isFirefox())
        return KeyboardEventKeyCode.FF_SEMICOLON
    if ((code === KeyboardEventCode.EQUAL) && isFirefox())
        return KeyboardEventKeyCode.FF_EQUAL
    if ((code === KeyboardEventCode.MINUS) && isFirefox())
        return KeyboardEventKeyCode.FF_MINUS
    if (code === KeyboardEventCode.NUM_LOCK && isMac())
        return KeyboardEventKeyCode.CLEAR
    if (code === KeyboardEventCode.NUMPAD_EQUAL && (isMac() || isLinux())) {
        if (isFirefox())
            return KeyboardEventKeyCode.FF_EQUAL
        return KeyboardEventKeyCode.EQUAL
    }
    if (code === KeyboardEventCode.F13 && isMac())
        return KeyboardEventKeyCode.PRINTSCREEN
    if (code === KeyboardEventCode.F14 && isMac())
        return KeyboardEventKeyCode.SCROLL_LOCK
    if (code === KeyboardEventCode.F15 && isMac())
        return KeyboardEventKeyCode.PAUSE

    if (code === KeyboardEventCode.PRINT_SCREEN && isMac())
        return KeyboardEventKeyCode.F13
    if (code === KeyboardEventCode.SCROLL_LOCK && isMac())
        return KeyboardEventKeyCode.F14
    if (code === KeyboardEventCode.PAUSE && isMac())
        return KeyboardEventKeyCode.F15
    if (code === KeyboardEventCode.HELP) {
        if (isMac())
            return KeyboardEventKeyCode.MAC_HELP
        if (isLinux())
            return KeyboardEventKeyCode.LINUX_HELP
    }

    if (code === KeyboardEventCode.INTL_RO) {
        if (isWindows() && isChrome())
            return KeyboardEventKeyCode.IE_WIN_INTLRO
        if (isMac() && isFirefox())
            return KeyboardEventKeyCode.FOX_MAC_INTLRO
        if (isLinux())
            return KeyboardEventKeyCode.UNKNOWN
        if (isMac())
            return KeyboardEventKeyCode.IE_MAC_INTLRO
        return KeyboardEventKeyCode.UNKNOWN
    }

    if (code === KeyboardEventCode.INTL_YEN && isFirefox()) {
        if (isWindows())
            return KeyboardEventKeyCode.FF_WIN_INTLYEN
        if (isMac())
            return KeyboardEventKeyCode.FF_MAC_INTLYEN
    }
    /**
     * in MAC
     * keypress event is fired whose keyCode and charCode are 0x10 (16)
     * but text isn't inputted into editor.
     */
    if (code === KeyboardEventCode.CONTENT_MENU && isMac())
        return KeyboardEventKeyCode.UNKNOWN

    const result = CODE_KEYCODE_MAP.get(code)
    if (result === undefined)
        return KeyboardEventKeyCode.UNKNOWN
    return result
}
