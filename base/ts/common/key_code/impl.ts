/**
 * https://www.w3.org/TR/uievents-code/.
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code.
 * `KeyboardEvent.code` property represents a physical key on the keyboard.
 */
export const enum KeyboardEventCode {
    /**
     * `~ on a US keyboard. This is the 半角/全角/漢字 (hankaku/zenkaku/kanji)
     * key on Japanese keyboard.
     */
    BACKQUOTE = 'Backquote',
    /**
     * 'Used for both the US \| (on the 101-key layout) and also for the key
     * located between the and Enter keys on row C of the 102-, 104- and
     * 106-key layouts. Labelled #~ on a UK (102) keyboard'.
     */
    BACKSLASH = 'Backslash',
    /**
     *  Backspace or ⌫. Labelled Delete on Apple keyboards.
     */
    BACKSPACE = 'Backspace',
    /**
     * [{ on a US keyboard.
     */
    BRACKET_LEFT = 'BracketLeft',
    /**
     * ]} on a US keyboard.
     */
    BRACKET_RIGHT = 'BracketRight',
    /**
     * ,< on a US keyboard.
     */
    COMMA = 'Comma',
    /**
     * 0) on a US keyboard.
     */
    DIGIT_0 = 'Digit0',
    /**
     * 1! on a US keyboard.
     */
    DIGIT_1 = 'Digit1',
    /**
     * 2@ on a US keyboard.
     */
    DIGIT_2 = 'Digit2',
    /**
     * 3# on a US keyboard.
     */
    DIGIT_3 = 'Digit3',
    /**
     * 4$ on a US keyboard.
     */
    DIGIT_4 = 'Digit4',
    /**
     * 5% on a US keyboard.
     */
    DIGIT_5 = 'Digit5',
    /**
     * 6^ on a US keyboard.
     */
    DIGIT_6 = 'Digit6',
    /**
     * 7& on a US keyboard.
     */
    DIGIT_7 = 'Digit7',
    /**
     * 8* on a US keyboard.
     */
    DIGIT_8 = 'Digit8',
    /**
     * 9( on a US keyboard.
     */
    DIGIT_9 = 'Digit9',
    /**
     * =+ on a US keyboard.
     */
    EQUAL = 'Equal',
    /**
     * Located between the left Shift and Z keys. Labelled \| on a UK keyboard.
     */
    INTL_BACKSLASH = 'IntlBackslash',
    /**
     * Located between the / and right Shift keys. Labelled \ろ (ro) on a
     * Japanese keyboard.
     */
    INTL_RO = 'IntlRo',
    /**
     * Located between the = and Backspace keys. Labelled ¥ (yen) on a Japanese
     * keyboard. \/ on a Russian keyboard.
     */
    INTL_YEN = 'IntlYen',
    /**
     * a on a US keyboard. Labelled q on an AZERTY (e.g., French) keyboard.
     */
    KEY_A = 'KeyA',
    /**
     * b on a US keyboard.
     */
    KEY_B = 'KeyB',
    /**
     * c on a US keyboard.
     */
    KEY_C = 'KeyC',
    /**
     * d on a US keyboard.
     */
    KEY_D = 'KeyD',
    /**
     * e on a US keyboard.
     */
    KEY_E = 'KeyE',
    /**
     * f on a US keyboard.
     */
    KEY_F = 'KeyF',
    /**
     * g on a US keyboard.
     */
    KEY_G = 'KeyG',
    /**
     * h on a US keyboard.
     */
    KEY_H = 'KeyH',
    /**
     * i on a US keyboard.
     */
    KEY_I = 'KeyI',
    /**
     * j on a US keyboard.
     */
    KEY_J = 'KeyJ',
    /**
     * k on a US keyboard.
     */
    KEY_K = 'KeyK',
    /**
     * l on a US keyboard.
     */
    KEY_L = 'KeyL',
    /**
     * m on a US keyboard.
     */
    KEY_M = 'KeyM',
    /**
     * n on a US keyboard.
     */
    KEY_N = 'KeyN',
    /**
     * o on a US keyboard.
     */
    KEY_O = 'KeyO',
    /**
     * p on a US keyboard.
     */
    KEY_P = 'KeyP',
    /**
     * q on a US keyboard. Labelled a on an AZERTY (e.g., French) keyboard.
     */
    KEY_Q = 'KeyQ',
    /**
     * r on a US keyboard.
     */
    KEY_R = 'KeyR',
    /**
     * s on a US keyboard.
     */
    KEY_S = 'KeyS',
    /**
     * t on a US keyboard.
     */
    KEY_T = 'KeyT',
    /**
     * u on a US keyboard.
     */
    KEY_U = 'KeyU',
    /**
     * v on a US keyboard.
     */
    KEY_V = 'KeyV',
    /**
     * w on a US keyboard. Labelled z on an AZERTY (e.g., French) keyboard.
     */
    KEY_W = 'KeyW',
    /**
     * x on a US keyboard.
     */
    KEY_X = 'KeyX',
    /**
     * y on a US keyboard. Labelled z on a QWERTZ (e.g., German) keyboard.
     */
    KEY_Y = 'KeyY',
    /**
     * z on a US keyboard. Labelled w on an AZERTY (e.g., French) keyboard, and
     * y on a QWERTZ (e.g., German) keyboard.
     */
    KEY_Z = 'KeyZ',
    /**
     * -_ on a US keyboard.
     */
    MINUS = 'Minus',
    /**
     * .> on a US keyboard.
     */
    PERIOD = 'Period',
    /**
     * on a US keyboard.
     */
    QUOTE = 'Quote',
    /**
     * ;: on a US keyboard.
     */
    SEMICOLON = 'Semicolon',
    /**
     * /? on a US keyboard.
     */
    SLASH = 'Slash',
    /**
     * Alt, Option or ⌥.
     */
    ALT_LEFT = 'AltLeft',
    /**
     * Alt, Option or ⌥. This is labelled AltGr key on many keyboard layouts.
     */
    ALT_RIGHT = 'AltRight',
    /**
     * CapsLock or ⇪.
     */
    CAPS_LOCK = 'CapsLock',
    /**
     * The application context menu key, which is typically found between the
     * right Meta key and the right Control key.
     */
    CONTENT_MENU = 'ContextMenu',
    /**
     * Control or ⌃.
     */
    CONTROL_LEFT = 'ControlLeft',
    /**
     * Control or ⌃.
     */
    CONTROL_RIGHT = 'ControlRight',
    /**
     * Enter or ↵. Labelled Return on Apple keyboards.
     */
    ENTER = 'Enter',
    /**
     * The Windows, ⌘, Command or other OS symbol key.
     */
    METALEFT = 'MetaLeft',
    /**
     * The Windows, ⌘, Command or other OS symbol key.
     */
    META_RIGHT = 'MetaRight',
    /**
     * Shift or ⇧.
     */
    SHIFT_LEFT = 'ShiftLeft',
    /**
     * Shift or ⇧.
     */
    SHIFT_RIGHT = 'ShiftRight',
    /**
     *   (space).
     */
    SPACE = 'Space',
    /**
     * Tab or ⇥.
     */
    TAB = 'Tab',
    /**
     * ⌦. The forward delete key. Note that on Apple keyboards, the key
     * labelled Delete on the main part of the keyboard should be encoded as
     * Backspace .
     */
    DELETE = 'Delete',
    /**
     * Page Down, End or ↘.
     */
    END = 'End',
    /**
     * Help. Not present on standard PC keyboards.
     */
    HELP = 'Help',
    /**
     * Home or ↖.
     */
    HOME = 'Home',
    /**
     * Insert or Ins. Not present on Apple keyboards.
     */
    INSERT = 'Insert',
    /**
     * Page Down, PgDn or ⇟.
     */
    PAGE_DOWN = 'PageDown',
    /**
     * Page Up, PgUp or ⇞.
     */
    PAGE_UP = 'PageUp',
    /**
     * ↓.
     */
    ARROW_DOWN = 'ArrowDown',
    /**
     * ←.
     */
    ARROW_LEFT = 'ArrowLeft',
    /**
     * →.
     */
    ARROW_RIGHT = 'ArrowRight',
    /**
     * ↑.
     */
    ARROW_UP = 'ArrowUp',
    /**
     * On the Mac, the  NumLock  code should be used for the numpad Clear key.
     */
    NUM_LOCK = 'NumLock',
    /**
     * 0 Ins on a keyboard.
     */
    NUMPAD_0 = 'Numpad0',
    /**
     * 1 End on a keyboard.
     */
    NUMPAD_1 = 'Numpad1',
    /**
     * 2 ↓ on a keyboard.
     */
    NUMPAD_2 = 'Numpad2',
    /**
     * 3 PgDn on a keyboard.
     */
    NUMPAD_3 = 'Numpad3',
    /**
     * 4 ← on a keyboard.
     */
    NUMPAD_4 = 'Numpad4',
    /**
     * 5 on a keyboard.
     */
    NUMPAD_5 = 'Numpad5',
    /**
     * 6 → on a keyboard.
     */
    NUMPAD_6 = 'Numpad6',
    /**
     * 7 Home on a keyboard.
     */
    NUMPAD_7 = 'Numpad7',
    /**
     * 8 ↑ on a keyboard.
     */
    NUMPAD_8 = 'Numpad8',
    /**
     * 9 PgUp on a keyboard.
     */
    NUMPAD_9 = 'Numpad9',
    /**
     * `+`.
     */
    NUMPAD_ADD = 'NumpadAdd',
    /**
     * Found on the Microsoft Natural Keyboard.
     */
    NUMPAD_BACKSPACE = 'NumpadBackspace',
    /**
     * C or AC (All Clear). Also for use with numpads that have a Clear key
     * that is separate from the NumLock key. On the Mac, the numpad Clear key
     * should always be encoded as NumLock .
     */
    NUMPAD_CLEAR = 'NumpadClear',
    /**
     * CE (Clear Entry).
     */
    NUMPAD_CLEAR_ENTRY = 'NumpadClearEntry',
    /**
     * `,` (thousands separator). For locales where the thousands separator is a
     * `.` (e.g., Brazil), this key may generate a `.`.
     */
    NUMPAD_COMMA = 'NumpadComma',
    /**
     * `.` Del. For locales where the decimal separator is , (e.g., Brazil),
     * this key may generate a `,.`.
     */
    NUMPAD_DECIMAL = 'NumpadDecimal',
    /**
     * `/`.
     */
    NUMPAD_DIVIDE = 'NumpadDivide',
    NUMPAD_ENTER = 'NumpadEnter',
    /**
     * `=`.
     */
    NUMPAD_EQUAL = 'NumpadEqual',
    /**
     * # on a phone or remote control device. This key is typically found below
     * the 9 key and to the right of the 0 key.
     */
    NUMPAD_HASH = 'NumpadHash',
    /**
     * M+ Add current entry to the value stored in memory.
     */
    NUMPAD_MEMORY_ADD = 'NumpadMemoryAdd',
    /**
     * MC Clear the value stored in memory.
     */
    NUMPAD_MEMORY_CLEAR = 'NumpadMemoryClear',
    /**
     * MR Replace the current entry with the value stored in memory.
     */
    NUMPAD_MEMEORY_RECALL = 'NumpadMemoryRecall',
    /**
     * MS Replace the value stored in memory with the current entry.
     */
    NUMPAD_MEMORY_STORE = 'NumpadMemoryStore',
    /**
     * M- Subtract current entry from the value stored in memory.
     */
    NUMPAD_MEMORY_SUBTRACT = 'NumpadMemorySubtract',
    /**
     * `*` on a keyboard. For use with numpads that provide mathematical
     * operations (+, -, * and /).
     */
    NUMPAD_MULTIPLY = 'NumpadMultiply',
    /**
     * NumpadStar  for the * key on phones and remote controls.
     */
    USE = 'Use',
    /**
     * ( Found on the Microsoft Natural Keyboard.
     */
    NUMPAD_PARENT_LEFT = 'NumpadParenLeft',
    /**
     * ) Found on the Microsoft Natural Keyboard.
     */
    NUMPAD_PARENT_RIGHT = 'NumpadParenRight',
    /**
     * `*` on a phone or remote control device. This key is typically found
     * below the 7 key and to the left of the 0 key.
     */
    NUMPAD_STAR = 'NumpadStar',
    /**
     * `-`.
     */
    NUMPAD_SUBTRACT = 'NumpadSubtract',
    /**
     *  Esc or ⎋.
     */
    ESCAPE = 'Escape',
    F1 = 'F1',
    F2 = 'F2',
    F3 = 'F3',
    F4 = 'F4',
    F5 = 'F5',
    F6 = 'F6',
    F7 = 'F7',
    F8 = 'F8',
    F9 = 'F9',
    F10 = 'F10',
    F11 = 'F11',
    F12 = 'F12',
    F13 = 'F13',
    F14 = 'F14',
    F15 = 'F15',
    /**
     * Fn This is typically a hardware key that does not generate a separate
     * code. Most keyboards do not place this key in the function section, but
     * it is included here to keep it with related keys.
     */
    FN = 'Fn',
    /**
     * FLock or FnLock. Function Lock key. Found on the Microsoft Natural
     * Keyboard.
     */
    FN_LOCK = 'FnLock',
    /**
     * PrtScr SysRq or Print Screen.
     */
    PRINT_SCREEN = 'PrintScreen',
    /**
     * Scroll Lock.
     */
    SCROLL_LOCK = 'ScrollLock',
    /**
     * Pause Break.
     */
    PAUSE = 'Pause',

    UNKNOWN = 'Unknown',
}

export const KEY_CODE_MAP = new Map<string, KeyboardEventCode>([
    ['Backquote', KeyboardEventCode.BACKQUOTE],
    ['Backslash', KeyboardEventCode.BACKSLASH],
    ['Backspace', KeyboardEventCode.BACKSPACE],
    ['BracketLeft', KeyboardEventCode.BRACKET_LEFT],
    ['BracketRight', KeyboardEventCode.BRACKET_RIGHT],
    ['Comma', KeyboardEventCode.COMMA],
    ['Digit0', KeyboardEventCode.DIGIT_0],
    ['Digit1', KeyboardEventCode.DIGIT_1],
    ['Digit2', KeyboardEventCode.DIGIT_2],
    ['Digit3', KeyboardEventCode.DIGIT_3],
    ['Digit4', KeyboardEventCode.DIGIT_4],
    ['Digit5', KeyboardEventCode.DIGIT_5],
    ['Digit6', KeyboardEventCode.DIGIT_6],
    ['Digit7', KeyboardEventCode.DIGIT_7],
    ['Digit8', KeyboardEventCode.DIGIT_8],
    ['Digit9', KeyboardEventCode.DIGIT_9],
    ['Equal', KeyboardEventCode.EQUAL],
    ['IntlBackslash', KeyboardEventCode.INTL_BACKSLASH],
    ['IntlRo', KeyboardEventCode.INTL_RO],
    ['IntlYen', KeyboardEventCode.INTL_YEN],
    ['KeyA', KeyboardEventCode.KEY_A],
    ['KeyB', KeyboardEventCode.KEY_B],
    ['KeyC', KeyboardEventCode.KEY_C],
    ['KeyD', KeyboardEventCode.KEY_D],
    ['KeyE', KeyboardEventCode.KEY_E],
    ['KeyF', KeyboardEventCode.KEY_F],
    ['KeyG', KeyboardEventCode.KEY_G],
    ['KeyH', KeyboardEventCode.KEY_H],
    ['KeyI', KeyboardEventCode.KEY_I],
    ['KeyJ', KeyboardEventCode.KEY_J],
    ['KeyK', KeyboardEventCode.KEY_K],
    ['KeyL', KeyboardEventCode.KEY_L],
    ['KeyM', KeyboardEventCode.KEY_M],
    ['KeyN', KeyboardEventCode.KEY_N],
    ['KeyO', KeyboardEventCode.KEY_O],
    ['KeyP', KeyboardEventCode.KEY_P],
    ['KeyQ', KeyboardEventCode.KEY_Q],
    ['KeyR', KeyboardEventCode.KEY_R],
    ['KeyS', KeyboardEventCode.KEY_S],
    ['KeyT', KeyboardEventCode.KEY_T],
    ['KeyU', KeyboardEventCode.KEY_U],
    ['KeyV', KeyboardEventCode.KEY_V],
    ['KeyW', KeyboardEventCode.KEY_W],
    ['KeyX', KeyboardEventCode.KEY_X],
    ['KeyY', KeyboardEventCode.KEY_Y],
    ['KeyZ', KeyboardEventCode.KEY_Z],
    ['Minus', KeyboardEventCode.MINUS],
    ['Period', KeyboardEventCode.PERIOD],
    ['Quote', KeyboardEventCode.QUOTE],
    ['Semicolon', KeyboardEventCode.SEMICOLON],
    ['Slash', KeyboardEventCode.SLASH],
    ['AltLeft', KeyboardEventCode.ALT_LEFT],
    ['AltRight', KeyboardEventCode.ALT_RIGHT],
    ['CapsLock', KeyboardEventCode.CAPS_LOCK],
    ['ContextMenu', KeyboardEventCode.CONTENT_MENU],
    ['ControlLeft', KeyboardEventCode.CONTROL_LEFT],
    ['ControlRight', KeyboardEventCode.CONTROL_RIGHT],
    ['Enter', KeyboardEventCode.ENTER],
    ['MetaLeft', KeyboardEventCode.METALEFT],
    ['MetaRight', KeyboardEventCode.META_RIGHT],
    ['ShiftLeft', KeyboardEventCode.SHIFT_LEFT],
    ['ShiftRight', KeyboardEventCode.SHIFT_RIGHT],
    ['Space', KeyboardEventCode.SPACE],
    ['Tab', KeyboardEventCode.TAB],
    ['Delete', KeyboardEventCode.DELETE],
    ['End', KeyboardEventCode.END],
    ['Help', KeyboardEventCode.HELP],
    ['Home', KeyboardEventCode.HOME],
    ['Insert', KeyboardEventCode.INSERT],
    ['PageDown', KeyboardEventCode.PAGE_DOWN],
    ['PageUp', KeyboardEventCode.PAGE_UP],
    ['ArrowDown', KeyboardEventCode.ARROW_DOWN],
    ['ArrowLeft', KeyboardEventCode.ARROW_LEFT],
    ['ArrowRight', KeyboardEventCode.ARROW_RIGHT],
    ['ArrowUp', KeyboardEventCode.ARROW_UP],
    ['NumLock', KeyboardEventCode.NUM_LOCK],
    ['Numpad0', KeyboardEventCode.NUMPAD_0],
    ['Numpad1', KeyboardEventCode.NUMPAD_1],
    ['Numpad2', KeyboardEventCode.NUMPAD_2],
    ['Numpad3', KeyboardEventCode.NUMPAD_3],
    ['Numpad4', KeyboardEventCode.NUMPAD_4],
    ['Numpad5', KeyboardEventCode.NUMPAD_5],
    ['Numpad6', KeyboardEventCode.NUMPAD_6],
    ['Numpad7', KeyboardEventCode.NUMPAD_7],
    ['Numpad8', KeyboardEventCode.NUMPAD_8],
    ['Numpad9', KeyboardEventCode.NUMPAD_9],
    ['NumpadAdd', KeyboardEventCode.NUMPAD_ADD],
    ['NumpadBackspace', KeyboardEventCode.NUMPAD_BACKSPACE],
    ['NumpadClear', KeyboardEventCode.NUMPAD_CLEAR],
    ['NumpadClearEntry', KeyboardEventCode.NUMPAD_CLEAR_ENTRY],
    ['NumpadComma', KeyboardEventCode.NUMPAD_COMMA],
    ['NumpadDecimal', KeyboardEventCode.NUMPAD_DECIMAL],
    ['NumpadDivide', KeyboardEventCode.NUMPAD_DIVIDE],
    ['NumpadEnter', KeyboardEventCode.NUMPAD_ENTER],
    ['NumpadEqual', KeyboardEventCode.NUMPAD_EQUAL],
    ['NumpadHash', KeyboardEventCode.NUMPAD_HASH],
    ['NumpadMemoryAdd', KeyboardEventCode.NUMPAD_MEMORY_ADD],
    ['NumpadMemoryClear', KeyboardEventCode.NUMPAD_MEMORY_CLEAR],
    ['NumpadMemoryRecall', KeyboardEventCode.NUMPAD_MEMEORY_RECALL],
    ['NumpadMemoryStore', KeyboardEventCode.NUMPAD_MEMORY_STORE],
    ['NumpadMemorySubtract', KeyboardEventCode.NUMPAD_MEMORY_SUBTRACT],
    ['NumpadMultiply', KeyboardEventCode.NUMPAD_MULTIPLY],
    ['Use', KeyboardEventCode.USE],
    ['NumpadParenLeft', KeyboardEventCode.NUMPAD_PARENT_LEFT],
    ['NumpadParenRight', KeyboardEventCode.NUMPAD_PARENT_RIGHT],
    ['NumpadStar', KeyboardEventCode.NUMPAD_STAR],
    ['NumpadSubtract', KeyboardEventCode.NUMPAD_SUBTRACT],
    ['Escape', KeyboardEventCode.ESCAPE],
    ['F1', KeyboardEventCode.F1],
    ['F2', KeyboardEventCode.F2],
    ['F3', KeyboardEventCode.F3],
    ['F4', KeyboardEventCode.F4],
    ['F5', KeyboardEventCode.F5],
    ['F6', KeyboardEventCode.F6],
    ['F7', KeyboardEventCode.F7],
    ['F8', KeyboardEventCode.F8],
    ['F9', KeyboardEventCode.F9],
    ['F10', KeyboardEventCode.F10],
    ['F11', KeyboardEventCode.F11],
    ['F12', KeyboardEventCode.F12],
    ['Fn', KeyboardEventCode.FN],
    ['FnLock', KeyboardEventCode.FN_LOCK],
    ['PrintScreen', KeyboardEventCode.PRINT_SCREEN],
    ['ScrollLock', KeyboardEventCode.SCROLL_LOCK],
    ['Pause', KeyboardEventCode.PAUSE],
])
/**
 * All you want is here
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * only for US keyboard
 * You should avoid using KeyboardEvent.keycode if possible;
 * it's been deprecated for some time.
 * Instead, you should use KeyboardEvent.code, if it's implemented.
 */
export const enum KeyboardEventKeyCode {
    UNKNOWN = 0,
    CANCEL = 3,
    BACK_SPACE = 8,
    TAB = 9,
    CLEAR = 12,
    ENTER = 13,
    SHIFT = 16,
    CONTROL = 17,
    ALT = 18,

    /**
     * in Mac see F15
     */
    PAUSE = 19,
    CAPS_LOCK = 20,
    ESCAPE = 27,
    SPACE = 32,
    PAGEUP = 33,
    PAGEDOWN = 34,
    END = 35,
    HOME = 36,
    LEFTARROW = 37,
    UPARROW = 38,
    RIGHTARROW = 39,
    DOWNARROW = 40,

    /**
     * only use in linux
     */
    PRINT = 42,
    EXECUTE = 43,

    /**
     * in Mac see F13
     */
    PRINTSCREEN = 44,

    /**
     * The "insert" in the standard keyboard
     * corresponds to the "help" in the apple keyboard
     */
    PC_INSERT = 45,
    /**
     * The "insert" in the standard keyboard
     * corresponds to the "help" in the apple keyboard
     */
    MAC_HELP = 6,
    DELETE = 46,

    LINUX_HELP = 47,

    /**
     * keycode values of each browser's keydown event
     * caused by printable keys in standard position:
     */
    DIGIT_0 = 48,
    DIGIT_1 = 49,
    DIGIT_2 = 50,
    DIGIT_3 = 51,
    DIGIT_4 = 52,
    DIGIT_5 = 53,
    DIGIT_6 = 54,
    DIGIT_7 = 55,
    DIGIT_8 = 56,
    DIGIT_9 = 57,

    SEMICOLON = 186,
    /**
     * only use in firefox browser
     */
    FF_SEMICOLON = 59,

    KEY_A = 65,
    KEY_B = 66,
    KEY_C = 67,
    KEY_D = 68,
    KEY_E = 69,
    KEY_F = 70,
    KEY_G = 71,
    KEY_H = 72,
    KEY_I = 73,
    KEY_J = 74,
    KEY_K = 75,
    KEY_L = 76,
    KEY_M = 77,
    KEY_N = 78,
    KEY_O = 79,
    KEY_P = 80,
    KEY_Q = 81,
    KEY_R = 82,
    KEY_S = 83,
    KEY_T = 84,
    KEY_U = 85,
    KEY_V = 86,
    KEY_W = 87,
    KEY_X = 88,
    KEY_Y = 89,
    KEY_Z = 90,

    OSLEFT = 91,
    /**
     * Only used in mac system
     */
    MAC_OSLEFT = 224,

    OSRIGHT = 91,

    MAC_OSRIGHT = 93,

    /**
     * Only used in firefox browser in mac system
     */
    FF_MAC_OSRIGHT = 224,
    /**
     * Only used in firefox browser in windows and linux system
     */
    FF_OSRIGHT = 91,

    MAC_META = 92,

    CONTEXT_MENU = 93,
    LEEP = 95,
    NUMPAD0 = 96,
    NUMPAD1 = 97,
    NUMPAD2 = 98,
    NUMPAD3 = 99,
    NUMPAD4 = 100,
    NUMPAD5 = 101,
    NUMPAD6 = 102,
    NUMPAD7 = 103,
    NUMPAD8 = 104,
    NUMPAD9 = 105,
    NUMPAD_MULTIPLY = 106,
    NUMPAD_ADD = 107,
    SEPARATOR = 108,
    NUMPAD_SUBTRACT = 109,
    NUMPAD_DECIMAL = 110,
    NUMPAD_DIVIDE = 111,
    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,

    /**
     * PC's "PrintScreen", "ScrollLock" and "Pause" are mapped to
     * Mac's "F13", "F14" and "F15".
     * Chrome and Safari map same keyCode values with Mac's keys.
     */
    /**
     * Chrome and Safari in Mac
     */
    F13 = 124,
    /**
     * Chrome and Safari in Mac
     */
    F14 = 125,
    /**
     * Chrome and Safari in Mac
     */
    F15 = 126,
    NUM_LOCK = 144,
    /**
     * in Mac see F14
     */
    SCROLL_LOCK = 145,

    /**
     * different in firefox see FF_EQUAL
     */
    EQUAL = 187,
    FF_EQUAL = 61,
    COMMA = 188,

    /**
     * different in firefox see FF_MINUS
     */
    MINUS = 189,
    FF_MINUS = 173,
    PERIOD = 190,
    SLASH = 191,
    BACKQUOTE = 192,
    NUMPAD_COMMA = 194,

    /**
     * INTLRO is special
     * IE, Chrome: win:  193
     * IE, Chrome: mac:  189
     * Chromeium: linux: no event
     * firefox: win, linux: 0
     * firefox: MAC: 167
     */
    IE_WIN_INTLRO = 193,
    IE_MAC_INTLRO = 189,
    FOX_MAC_INTLRO = 167,
    BRACKETLEFT = 219,
    BACKSLASH = 220,
    BRACKETRIGHT = 221,
    QUOTE = 222,
    META = 224,

    /**
     * only use in linux
     */
    ALTGR = 225,

    /**
     * chromium: linux: no events
     * firefox: win, linux: 0
     * firefox: mac: 220
     */
    INTLYEN = 255,
    FF_WIN_INTLYEN = 0,
    FF_MAC_INTLYEN = 220,

    /**
     * https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
     * If an Input Method Editor is processing key input and
     * the event is keydown, return 229.
     */
    KEY_IN_COMPOSITION = 229,

// tslint:disable-next-line: max-file-line-count
}
