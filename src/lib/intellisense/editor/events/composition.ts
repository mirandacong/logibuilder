import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Event, EventType} from './base'

/**
 * This event is simplified edition of the CompositionEvent in the browser.
 * Only user entering text indirectly will this event occurs.
 * (mainly means using input method editor)
 *
 * For detail: https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
 */
export interface EditorCompositonEvent extends Event {
    /**
     * The composition data.
     */
    readonly data: string
    readonly type: CompositionType
}

class EditorCompositonEventImpl implements Impl<EditorCompositonEvent> {
    public data!: string
    public type!: CompositionType
    public eventType = EventType.COMPOSITION
}

export class EditorCompositonEventBuilder extends
    Builder<EditorCompositonEvent, EditorCompositonEventImpl> {
    public constructor(obj?: Readonly<EditorCompositonEvent>) {
        const impl = new EditorCompositonEventImpl()
        if (obj)
            EditorCompositonEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public data(data: string): this {
        this.getImpl().data = data
        return this
    }

    public type(type: CompositionType): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return EditorCompositonEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['type']
}

export function isEditorCompositonEvent(
    obj: object,
): obj is EditorCompositonEvent {
    return obj instanceof EditorCompositonEventImpl
}

export const enum CompositionType {
    START = 'compositionstart',
    UPDATE = 'compositionupdate',
    END = 'compositionend',
}
