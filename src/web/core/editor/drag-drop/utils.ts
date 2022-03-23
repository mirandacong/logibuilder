import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {DropEffect, EffectAllowed} from './types'

export type DndDragImgOffsetFunction = (
        event: DragEvent, dragImg: Element,
    ) => {
        readonly x: number,
        readonly y: number,
    }

// tslint:disable-next-line: no-type-assertion
export const DROP_EFFECTS = ['move', 'copy', 'link'] as readonly DropEffect[]

export const CUSTOM_MIME_TYPE = 'application/x-dnd'
export const JSON_MIME_TYPE = 'application/json'
export const MSIE_MIME_TYPE = 'Text'

/**
 * DragDropData is used for DataTransfer to set data.
 */
export interface DragDropData {
    readonly data: readonly string[]
    readonly type?: string
}

/**
 * DndEvent extends DOM dragEvent.
 */
export interface DndEvent extends DragEvent {
    // tslint:disable-next-line: readonly-keyword
    dndUsingHandle?: boolean
    // tslint:disable-next-line: readonly-keyword
    dndDropzoneActive?: true
}

/**
 * For drop event.
 */
export interface DndDropEvent {
    readonly event: DragEvent
    readonly dropEffect: DropEffect
    readonly isExternal: boolean
    readonly data: readonly string[]
    readonly index: number
    readonly type?: unknown
}

class DndDropEventImpl implements DndDropEvent {
    public event!: DragEvent
    public dropEffect!: DropEffect
    public isExternal!: boolean
    public data: readonly string[] = []
    public index!: number
    public type?: unknown
}

/**
 * Filter effects from allowed.
 */
export function filterEffects(
    effects: readonly DropEffect[],
    allowed: string,
): readonly DropEffect[] {
    if (allowed === 'all' || allowed === 'uninitialized')
        return effects
    return effects.filter((
        e: DropEffect,
    ): boolean => allowed.toLowerCase().indexOf(e) !== -1)
}

/**
 * Use DOM dataTransfer to set drag data.
 */
export function setDragData(
    event: DragEvent,
    data: DragDropData,
    effectAllowed: EffectAllowed,
): void {
    /**
     * Internet Explorer and Microsoft Edge don't support custom mime types
     * see design doc: https://github.com/marceljuenemann/angular-drag-and-drop-lists/wiki/Data-Transfer-Design
     */
    const mimeType = CUSTOM_MIME_TYPE + (data.type ? ('-' + data.type) : '')
    const dataString = JSON.stringify(data)
    // tslint:disable-next-line: no-try
    try {
        if (event.dataTransfer === null)
            return
        event.dataTransfer.setData(mimeType, dataString)
    } catch (e) {
        /**
         * Setting a custom MIME type didn't work, we are probably in IE or Edge
         */
        // tslint:disable-next-line: no-try
        try {
            event.dataTransfer?.setData(JSON_MIME_TYPE, dataString)
        } catch (e) {
            /**
             * We are in Internet Explorer and can only use the Text MIME type.
             * Also note that IE does not allow changing the cursor in the
             * dragover event, therefore we have to choose the one we want to
             * display now by setting effectAllowed.
             */
            const ea = filterEffects(DROP_EFFECTS, effectAllowed)
            if (event.dataTransfer === null)
                return
            event.dataTransfer.effectAllowed = ea[0]
            event.dataTransfer.setData(MSIE_MIME_TYPE, dataString)
        }
    }
}

/**
 * drop data getter.
 */
export function getDropData(
    event: DragEvent,
    dragIsExternal: boolean,
): Readonly<DragDropData> | undefined {
    const builder = new DragDropDataBuilder()
    /**
     * check if the mime type is well known.
     */
    const mimeType = getWellKnownMimeType(event)
    /**
     * drag did not originate from [logiDndDraggable].
     */
    if (dragIsExternal) {
        if (mimeType !== undefined && mimeTypeIsCustom(mimeType)
            && event.dataTransfer !== null) {
            const transferData = JSON
                .parse(event.dataTransfer.getData(mimeType)) as any
            if (transferData.data === undefined)
                return
            builder.data(transferData.data)
            return transferData.type !== undefined ? builder
                .type(transferData.type)
                .build()
                    : builder.build()
        }
        return
    }
    if (event.dataTransfer === null || mimeType === undefined)
        return
    const data = JSON.parse(event.dataTransfer.getData(mimeType)) as any
    if (data.data === undefined)
        return
    builder.data(data.data)
    return data.type !== undefined ? builder.type(data.type).build()
        : builder.build()
}

/**
 * use dataTransfer to setDragImage.
 */
export function setDragImg(
    event: DragEvent,
    dragImg: Element,
    offsetFunction: DndDragImgOffsetFunction,
): void {
    const offset = offsetFunction(event, dragImg) || {x: 0, y: 0}
    if (event.dataTransfer === null)
        return
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage.
     */
    event.dataTransfer.setDragImage(dragImg, offset.x, offset.y)
}

/**
 * Calculate drag image offset.
 */
export function calcDragImgOffset(
    event: DragEvent,
    dragImg: Element,
): { readonly x: number, readonly y: number } {
    const dragImageComputedStyle = window.getComputedStyle(dragImg)
    // tslint:disable: ban
    const paddingTop = parseFloat(dragImageComputedStyle.paddingTop) || 0
    const paddingLeft = parseFloat(dragImageComputedStyle.paddingLeft) || 0
    const borderTop = parseFloat(dragImageComputedStyle.borderTopWidth) || 0
    const borderLeft = parseFloat(dragImageComputedStyle.borderLeftWidth) || 0

    return {
        x: event.offsetX + paddingLeft + borderLeft,
        y: event.offsetY + paddingTop + borderTop,
    }
}

/**
 * Check if mimeType is custom.
 */
export function mimeTypeIsCustom(mimeType: string): boolean {
    return mimeType.substr(0, CUSTOM_MIME_TYPE.length) === CUSTOM_MIME_TYPE
}

/**
 * Find well-known mimeType
 */
export function getWellKnownMimeType(event: DragEvent): string | undefined {
    if (event.dataTransfer === null)
        return
    const types = event.dataTransfer.types
    /**
     * IE 9 workaround..
     */
    if (!types)
        return MSIE_MIME_TYPE

    // tslint:disable-next-line: no-undefined-keyword
    let currType: string | undefined
    types.forEach((t: string): void => {
        if (t === MSIE_MIME_TYPE
            || t === JSON_MIME_TYPE || mimeTypeIsCustom(t))
            currType = t
    })
    return currType
}

/**
 * Find direct child element.
 */
export function getDirectChildElement(
    parentElement: Element,
    childElement: Element,
): Element | undefined {
    let directChild: Node = childElement
    while (directChild.parentNode !== parentElement) {
        /**
         * reached root node without finding given parent
         */
        if (!directChild.parentNode)
            return
        directChild = directChild.parentNode
    }
    // tslint:disable-next-line: no-type-assertion
    return directChild as Element
}

/**
 * Set position of placeholder.
 */
export function shouldPositionPlaceholderBeforeElement(
    event: DragEvent,
    element: Element,
    horizontal: boolean,
): boolean {
    const bounds = element.getBoundingClientRect()
    const half = 2
    /**
     * If the pointer is in the upper half of the list item element, we position
     * the placeholder before the list item, otherwise after it.
     */
    if (horizontal)
        return (event.clientX < bounds.left + bounds.width / half)
    return (event.clientY < bounds.top + bounds.height / half)
}

class DragDropDataImpl implements DragDropData {
    public data!: readonly string[]
    public type?: string
}

export class DragDropDataBuilder
extends Builder<DragDropData, DragDropDataImpl> {
    public constructor(obj?: Readonly<DragDropData>) {
        const impl = new DragDropDataImpl()
        if (obj)
            DragDropDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public data(data: readonly string[]): this {
        this.getImpl().data = data
        return this
    }

    public type(type: string): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return DragDropDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['data']
}

export function isDragDropData(obj: unknown): obj is Readonly<DragDropData> {
    return obj instanceof DragDropDataImpl
}

class DndEventImpl implements Impl<DndEvent> {
    public dndUsingHandle?: boolean
    public dndDropzoneActive?: true
}

export class DndEventBuilder extends Builder<DndEvent, DndEventImpl> {
    public constructor(obj?: Readonly<DndEvent>) {
        const impl = new DndEventImpl()
        if (obj)
            DndEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public dndUsingHandle(dndUsingHandle: boolean): this {
        this.getImpl().dndUsingHandle = dndUsingHandle
        return this
    }

    public dndDropzoneActive(dndDropzoneActive: true): this {
        this.getImpl().dndDropzoneActive = dndDropzoneActive
        return this
    }

    protected get daa(): readonly string[] {
        return DndEventBuilder.__DAA_PROPS__
    }
}

// tslint:disable-next-line: comment-for-export-and-public
export function isDndEvent(obj: unknown): obj is DndEvent {
    return obj instanceof DndEventImpl
}

// tslint:disable-next-line: max-classes-per-file
export class DndDropEventBuilder
extends Builder<DndDropEvent, DndDropEventImpl> {
    public constructor(obj?: Readonly<DndDropEvent>) {
        const impl = new DndDropEventImpl()
        if (obj)
            DndDropEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public event(event: DragEvent): this {
        this.getImpl().event = event
        return this
    }

    public dropEffect(dropEffect: DropEffect): this {
        this.getImpl().dropEffect = dropEffect
        return this
    }

    public isExternal(isExternal: boolean): this {
        this.getImpl().isExternal = isExternal
        return this
    }

    public data(data: readonly string[]): this {
        this.getImpl().data = data
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    public type(type: unknown): this {
        this.getImpl().type = type
        return this
    }
}

export function isDndDropEvent(obj: unknown): obj is DndDropEvent {
    return obj instanceof DndDropEventImpl
}
