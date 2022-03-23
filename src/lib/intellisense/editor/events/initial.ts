import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {EditorLocation, Event, EventType} from './base'

export interface EditorInitialEvent extends Event {
    readonly expression: string
    readonly loc: Readonly<EditorLocation>
}

class EditorInitialEventImpl implements Impl<EditorInitialEvent> {
    public expression!: string
    public loc!: Readonly<EditorLocation>
    public eventType = EventType.INITIAL
}

export class EditorInitialEventBuilder extends
    Builder<EditorInitialEvent, EditorInitialEventImpl> {
    public constructor(obj?: Readonly<EditorInitialEvent>) {
        const impl = new EditorInitialEventImpl()
        if (obj)
            EditorInitialEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public expression(expression: string): this {
        this.getImpl().expression = expression
        return this
    }

    public loc(loc: Readonly<EditorLocation>): this {
        this.getImpl().loc = loc
        return this
    }

    protected get daa(): readonly string[] {
        return EditorInitialEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'expression',
        'loc',
    ]
}

export function isEditorInitialEvent(obj: object): obj is EditorInitialEvent {
    return obj instanceof EditorInitialEventImpl
}
