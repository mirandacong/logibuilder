import {
    isNumPad,
    KeyboardEventCode,
    KeyboardEventKeyCode,
    KEY_CODE_MAP,
} from '@logi/base/ts/common/key_code'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {
    CompositionType,
    CtrlKeyvEvent,
    CtrlKeyvEventBuilder,
    EditorCompositonEvent,
    EditorCompositonEventBuilder,
    EditorDisplayUnit,
    EditorFocusEvent,
    EditorFocusEventBuilder,
    EditorInputEvent,
    EditorInputEventBuilder,
    EditorKeyboardEvent,
    EditorKeyboardEventBuilder,
    EditorLocationBuilder,
    InputType,
    Location,
} from '@logi/src/lib/intellisense'
const STOP_PROPAGATION: readonly string[] = [
    KeyboardEventCode.ESCAPE,
    KeyboardEventCode.ENTER,
    KeyboardEventCode.TAB,
    KeyboardEventCode.ARROW_UP,
    KeyboardEventCode.ARROW_DOWN,
]

// tslint:disable-next-line: max-func-body-length
export function createKeyEvent(
    e: KeyboardEvent,
): EditorKeyboardEvent | undefined {
    /**
     * If `NumLock` is off, disable input.
     * https://www.w3schools.com/JSREF/event_key_getmodifierstate.asp
     */
    if (!e.getModifierState('NumLock') && isNumPad(e.code)) {
        e.stopPropagation()
        e.preventDefault()
        return
    }
    /**
     * 229 is a special value set for a keyCode relating to an event that has
     * been processed by an IME.
     *
     * From: https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
     */
    // tslint:disable-next-line: no-magic-numbers
    if (isPasteEvent(e) || e.keyCode === KeyboardEventKeyCode.KEY_IN_COMPOSITION
        || e.isComposing)
        return
    e.preventDefault()
    if (STOP_PROPAGATION.includes(e.code))
        e.stopPropagation()
    /**
     * When using IME(input method editor), to input a chinese character('我'),
     * the event stream will like (in chrome):
     *
     * keydown {isComposing: false, key: 'Unidentified', code: '', keyCode: 229}
     * compositionstart {data: ''}
     * compositionupdate {data: '我'}
     * input {isComposing: true, data: '我', inputType: 'insertCompositionText'}
     * keydown {isComposing: true, key: 'Unidentified', code: '', keyCode: 229}
     * compositionupdate {data: '我'}
     * input {isComposing: true, data: '我', inputType: 'insertCompositionText'}
     * keydown {isComposing: true, key: 'Unidentified', code: '', keyCode: 229}
     * compositionend {data: '我'}
     * input {isComposing: false, data: '我', inputType: 'insertCompositionText'}
     *
     * see: https://www.fxsitecompat.dev/en-CA/docs/2018/keydown-and-keyup-events-are-now-fired-during-ime-composition/
     *
     * Because the `code` of keydown event is always empty, the `keyCode`
     * get from KEY_CODE_MAP is undefined. So it will not build editor keyboard
     * event.
     *
     * TODO (kai): Consider more cases and optimize.
     */
    const code = KEY_CODE_MAP.get(e.code)
    if (code === undefined)
        return
    return new EditorKeyboardEventBuilder()
        .ctrlKey(e.ctrlKey)
        .altKey(e.altKey)
        .shiftKey(e.shiftKey)
        .metaKey(e.metaKey)
        .key(e.key)
        .code(code)
        .build()
}

export function createCompositionEvent(
    e: CompositionEvent,
): EditorCompositonEvent {
    return new EditorCompositonEventBuilder()
        .data(e.data)
        // tslint:disable-next-line: no-type-assertion
        .type(e.type as CompositionType)
        .build()
}

export function createBlurEvent(
    node: Readonly<FormulaBearer>,
    units: readonly Readonly<EditorDisplayUnit>[],
    slice?: Readonly<SliceExpr>,
): EditorFocusEvent {
    return new EditorFocusEventBuilder()
        .isBlur(true)
        .editorText(units)
        .location(new EditorLocationBuilder()
            .loc(Location.RIGHT)
            .node(node)
            .sliceExpr(slice)
            .build())
        .build()
}

export function createInputEvent(e: InputEvent): EditorInputEvent {
    return new EditorInputEventBuilder()
        .data(e.data ?? '')
        // tslint:disable-next-line: no-type-assertion
        .inputType(e.inputType as InputType)
        .isComposing(e.isComposing)
        .build()
}

export function createPasteEvent(e: ClipboardEvent): CtrlKeyvEvent {
    return new CtrlKeyvEventBuilder()
        .paste(e.clipboardData?.getData('text/plain') ?? '')
        .build()
}

function isPasteEvent(e: KeyboardEvent): boolean {
    return e.code === KeyboardEventCode.KEY_V && (e.ctrlKey || e.metaKey)
}
