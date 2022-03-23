import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {EditorDisplayUnit} from '../display/textbox/unit'

import {EditorLocation, Event, EventType} from './base'

/**
 * Indicate the event which focuses on the textbox or blurs from the textbox.
 * This event is a simplified editon of `FocusEvent` in the browser.
 *
 * For detail:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/focus_event
 */
export interface EditorFocusEvent extends Event {
    readonly isBlur: boolean
    readonly location: Readonly<EditorLocation>
    /**
     * The current content of this textbox.
     */
    readonly editorText: readonly EditorDisplayUnit[]
}

class EditorFocusEventImpl implements Impl<EditorFocusEvent> {
    public isBlur!: boolean
    public location!: Readonly<EditorLocation>
    public editorText: readonly EditorDisplayUnit[] = []
    public eventType = EventType.FOCUS
}

export class EditorFocusEventBuilder extends
    Builder<EditorFocusEvent, EditorFocusEventImpl> {
    public constructor(obj?: Readonly<EditorFocusEvent>) {
        const impl = new EditorFocusEventImpl()
        if (obj)
            EditorFocusEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public isBlur(value: boolean): this {
        this.getImpl().isBlur = value
        return this
    }

    public location(location: Readonly<EditorLocation>): this {
        this.getImpl().location = location
        return this
    }

    public editorText(editorText: readonly EditorDisplayUnit[]): this {
        this.getImpl().editorText = editorText
        return this
    }

    protected get daa(): readonly string[] {
        return EditorFocusEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['isBlur']
}

export function isEditorFocusEvent(obj: object): obj is EditorFocusEvent {
    return obj instanceof EditorFocusEventImpl
}
