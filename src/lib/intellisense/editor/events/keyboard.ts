import {Builder} from '@logi/base/ts/common/builder'
import {KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Event, EventType} from './base'

/**
 * Indicate the event that user press the us keyboard. This event is a
 * simplified edition of `KeyboardEvent`. In the browser, `InputEvent` and
 * `CompositionEvent` can also occur `KeyboardEvent`, but in these case, the
 * keyCode of KeyboardEvent must be `unidentified` and `EditorKeyboardEvent`
 * will not be built.
 *
 * Notice that the input character in this event is
 * only half-width character.
 */
export interface EditorKeyboardEvent extends Event {
    readonly key: string
    readonly ctrlKey: boolean
    readonly altKey: boolean
    readonly shiftKey: boolean
    readonly metaKey: boolean
    readonly code: KeyboardEventCode

    /**
     * Check if the parameter `event` is equal to this event.
     *
     */
    typeEqual(event: EditorKeyboardEvent): boolean
}

class EditorKeyboardEventImpl implements Impl<EditorKeyboardEvent> {
    public ctrlKey = false
    public altKey = false
    public metaKey = false
    public shiftKey = false
    public code!: KeyboardEventCode
    public key!: string
    public eventType: EventType = EventType.KEYBOARD

    public typeEqual(event: EditorKeyboardEvent): boolean {
        if (this.ctrlKey !== event.ctrlKey)
            return false
        if (this.altKey !== event.altKey)
            return false
        if (this.metaKey !== event.metaKey)
            return false
        if (this.shiftKey !== event.shiftKey)
            return false
        if (this.code !== event.code)
            return false
        return true
    }
}

// tslint:disable-next-line: max-classes-per-file
export class EditorKeyboardEventBuilder extends
    Builder<EditorKeyboardEvent, EditorKeyboardEventImpl> {
    public constructor(obj?: Readonly<EditorKeyboardEvent>) {
        const impl = new EditorKeyboardEventImpl()
        if (obj)
            EditorKeyboardEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public ctrlKey(ctrlKey: boolean): this {
        this.getImpl().ctrlKey = ctrlKey
        return this
    }

    public altKey(altKey: boolean): this {
        this.getImpl().altKey = altKey
        return this
    }

    public metaKey(metaKey: boolean): this {
        this.getImpl().metaKey = metaKey
        return this
    }

    public shiftKey(shiftKey: boolean): this {
        this.getImpl().shiftKey = shiftKey
        return this
    }

    public code(code: KeyboardEventCode): this {
        this.getImpl().code = code
        return this
    }

    public key(value: string): this {
        this.getImpl().key = value
        return this
    }

    protected get daa(): readonly string[] {
        return EditorKeyboardEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'code',
    ]
}

export function isEditorKeyboardEvent(
    obj: unknown,
): obj is EditorKeyboardEvent {
    return obj instanceof EditorKeyboardEventImpl
}

export interface CtrlKeyvEvent extends EditorKeyboardEvent {
    readonly paste: string
}

class CtrlKeyvEventImpl extends EditorKeyboardEventImpl
    implements Impl<CtrlKeyvEvent> {
    public paste!: string
    public ctrlKey = true
    public key = 'v'
    public code = KeyboardEventCode.KEY_V
}

export class CtrlKeyvEventBuilder extends
    Builder<CtrlKeyvEvent, CtrlKeyvEventImpl> {
    public constructor(obj?: Readonly<CtrlKeyvEvent>) {
        const impl = new CtrlKeyvEventImpl()
        if (obj)
            CtrlKeyvEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public paste(paste: string): this {
        this.getImpl().paste = paste
        return this
    }

    protected get daa(): readonly string[] {
        return CtrlKeyvEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['paste']
}

export function isCtrlKeyvEvent(obj: unknown): obj is CtrlKeyvEvent {
    return obj instanceof CtrlKeyvEventImpl
}
