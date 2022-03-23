import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {EditorDisplayUnit} from '../display/textbox/unit'

import {EditorLocation, Event, EventType} from './base'

/**
 * The mouse event happens in the simple editor.
 */
export interface EditorMouseEvent extends Event {
    readonly leftButton: boolean
    readonly middleButton: boolean
    readonly rightButton: boolean
    readonly location: Readonly<EditorLocation>
    /**
     * The current content of the textbox.
     *
     * Notice that this pattern is also the response we deliver back to
     * frontend.
     */
    readonly editorText: readonly EditorDisplayUnit[]
    /**
     * The start offset of the text in the simple editor.
     */
    readonly startOffset: number
    /**
     * The end offset of the text. Indicates the selected text.
     */
    readonly endOffset: number
    readonly ctrlKey: boolean
    readonly altKey: boolean
    readonly shiftKey: boolean
    readonly metaKey: boolean
}

class EditorMouseEventImpl implements Impl<EditorMouseEvent> {
    public leftButton = false
    public middleButton = false
    public rightButton = false
    public ctrlKey = false
    public altKey = false
    public shiftKey = false
    public metaKey = false
    public location!: Readonly<EditorLocation>
    public startOffset = 0
    public endOffset = 0
    public editorText: readonly EditorDisplayUnit[] = []
    public eventType: EventType = EventType.MOUSE
}

export class EditorMouseEventBuilder extends
    Builder<EditorMouseEvent, EditorMouseEventImpl> {
    public constructor(obj?: Readonly<EditorMouseEvent>) {
        const impl = new EditorMouseEventImpl()
        if (obj)
            EditorMouseEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public leftButton(leftButton: boolean): this {
        this.getImpl().leftButton = leftButton
        return this
    }

    public middleButton(middleButton: boolean): this {
        this.getImpl().middleButton = middleButton
        return this
    }

    public rightButton(rightButton: boolean): this {
        this.getImpl().rightButton = rightButton
        return this
    }

    public ctrlKey(ctrlKey: boolean): this {
        this.getImpl().ctrlKey = ctrlKey
        return this
    }

    public altKey(altKey: boolean): this {
        this.getImpl().altKey = altKey
        return this
    }

    public shiftKey(shiftKey: boolean): this {
        this.getImpl().shiftKey = shiftKey
        return this
    }

    public metaKey(metaKey: boolean): this {
        this.getImpl().metaKey = metaKey
        return this
    }

    public location(loc: Readonly<EditorLocation>): this {
        this.getImpl().location = loc
        return this
    }

    public startOffset(startOffset: number): this {
        this.getImpl().startOffset = startOffset
        return this
    }

    public endOffset(endOffset: number): this {
        this.getImpl().endOffset = endOffset
        return this
    }

    public editorText(editorContent: readonly EditorDisplayUnit[]): this {
        this.getImpl().editorText = editorContent
        return this
    }

    protected get daa(): readonly string[] {
        return EditorMouseEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'location',
    ]
}

export function isEditorMouseEvent(obj: unknown): obj is EditorMouseEvent {
    return obj instanceof EditorMouseEventImpl
}

export interface ClickPanelEvent extends EditorMouseEvent {
    readonly id: number
}

class ClickPanelEventImpl extends EditorMouseEventImpl
    implements Impl<ClickPanelEvent> {
    public id!: number
}

export class ClickPanelEventBuilder extends
    Builder<ClickPanelEvent, ClickPanelEventImpl> {
    public constructor(obj?: Readonly<ClickPanelEvent>) {
        const impl = new ClickPanelEventImpl()
        if (obj)
            ClickPanelEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public id(id: number): this {
        this.getImpl().id = id
        return this
    }

    protected get daa(): readonly string[] {
        return ClickPanelEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['id']
}

export function isClickPanelEvent(obj: unknown): obj is ClickPanelEvent {
    return obj instanceof ClickPanelEventImpl
}
