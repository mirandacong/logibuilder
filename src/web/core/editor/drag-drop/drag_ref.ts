import {EventEmitter, Injectable, TemplateRef} from '@angular/core'
import {MoveActionBuilder} from '@logi/src/lib/api'
import {Node} from '@logi/src/lib/hierarchy/core'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api'

import {DraggableDirective} from './draggable.directive'
import {DropzoneDirective} from './dropzone.directive'
import {DndStateBuilder} from './state'
import {DropEffect, EffectAllowed} from './types'
import {
    CUSTOM_MIME_TYPE,
    DROP_EFFECTS,
    filterEffects,
    getWellKnownMimeType,
    JSON_MIME_TYPE,
    MSIE_MIME_TYPE,
} from './utils'

@Injectable()
/**
 * Drag drop service.
 */
export class DndService {
    public constructor(
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _studioApiSvc: StudioApiService,
    ) {}

    // tslint:disable-next-line: no-optional-parameter
    public setCurrDropZone(dropZone?: DropzoneDirective): void {
        if (dropZone !== this._currDropZone)
            this._currDropZone?.cleanupDragoverState()
        this._currDropZone = dropZone
    }

    public shouldClearStatus(dropZone: DropzoneDirective): boolean {
        return dropZone !== this._currDropZone
    }

    /**
     * Record current drag element.
     */
    public setDragElement(el: HTMLElement): void {
        this._dragElement = el
    }

    /**
     * Get focused nodes' uuid.
     */
    public getDragNodes(): readonly string[] {
        const focusNodes = this._nodeFocusSvc
            .getSelNodes()
            .map((n: Readonly<Node>): string => n.uuid)
        if (this._currDragNode === undefined)
            return []
        if (focusNodes.includes(this._currDragNode))
            return focusNodes
        return focusNodes.concat(this._currDragNode)
    }

    /**
     * Get current drag element.
     */
    public getDragElement(): HTMLElement | undefined {
        return this._dragElement
    }

    /**
     * Set value by './drag_image' directive.
     * If template is undefined, get dragImage by uuid.
     * If template is not undefined, store dragImage.
     */
    public getOrSetDragImages(
        uuid: string,
        // tslint:disable-next-line: no-optional-parameter
        template?: TemplateRef<unknown>,
    ): TemplateRef<unknown> | undefined {
        if (template !== undefined)
            this._dragImages.set(uuid, template)
        return this._dragImages.get(uuid)
    }

    // tslint:disable-next-line: no-optional-parameter
    public getOrSetIsDragging(isDragging?: boolean): boolean {
        if (isDragging !== undefined)
            this._isDragging = isDragging
        return this._isDragging
    }

    /**
     * Get drag effect allowed.
     */
    public getEffectAllowd(): string {
        return this._dragState.effectAllowed
    }

    /**
     * Update this._dragState when drag starts..
     */
    public dragStart(directive: DraggableDirective): void {
        this._dragState = new DndStateBuilder()
            .isDragging(true)
            .dropEffect(directive.dndDropEffect)
            .effectAllowed(directive.dndEffectAllowed)
            .types([directive.dndType])
            .build()
        this.setDragElement(directive.dragElement)
    }

    /**
     * Handle drag end event.
     */
    public dragEnd(directive: DraggableDirective, event: DragEvent): void {
        this._nodeFocusSvc.setDragNode(false)
        const dropEffect = this._dragState.dropEffect
        let dropEffectEmitter: EventEmitter<DragEvent>
        switch (dropEffect) {
        case 'copy':
            dropEffectEmitter = directive.dndCopied$
            break
        case 'link':
            dropEffectEmitter = directive.dndLinked$
            break
        case 'move':
            dropEffectEmitter = directive.dndMoved$
            break
        default:
            dropEffectEmitter = directive.dndCanceled$
        }
        dropEffectEmitter.next(event)
        this._onDrop(event)
        directive.dndEnd$.next(event)
        this._dragState = new DndStateBuilder().build()
    }

    /**
     * Use dragEvent to set drop effect.
     */
    public setDropEffect(event: DragEvent, dropEffect: DropEffect): void {
        if (this._dragState.isDragging) {
            const ea = this._dragState.effectAllowed
            const tp = this._dragState.types
            const state = new DndStateBuilder()
                .isDragging(true)
                .dropEffect(dropEffect)
            if (ea !== undefined)
                state.effectAllowed(ea)
            if (tp !== undefined)
                state.types(tp)
            this._dragState = state.build()
        }
        if (event.dataTransfer === null)
            return
        event.dataTransfer.dropEffect = dropEffect
    }

    /**
     * Store drag directive.
     */
    public registryDragDirective(
        uuid: string,
        directive: DraggableDirective,
    ): void {
        this._dragRefMap.set(uuid, directive)
    }

    /**
     * Find drop effect.
     */
    public getDropEffect(
        event: DragEvent,
        effectAllowed: EffectAllowed | DropEffect = 'uninitialized',
    ): DropEffect {
        const dataTransferEffectAllowed = event.dataTransfer
            ? event.dataTransfer.effectAllowed
            : 'uninitialized'
        let effects = filterEffects(DROP_EFFECTS, dataTransferEffectAllowed)
        if (this._dragState.isDragging && this._dragState.effectAllowed)
            effects = filterEffects(effects, this._dragState.effectAllowed)
        if (effectAllowed)
            effects = filterEffects(effects, effectAllowed)
    /**
     * MacOS automatically filters dataTransfer.effectAllowed depending on
     * the modifier keys, therefore the following modifier keys will only affect
     * other operating systems.
     */
        if (effects.length === 0)
            return 'none'
        if (event.ctrlKey && effects.indexOf('copy') !== -1)
            return 'copy'
        if (event.altKey && effects.indexOf('link') !== -1)
            return 'link'
        return effects[0]
    }

    /**
     * Find type.
     */
    public getDndType(event: DragEvent): readonly string[] | undefined {
        if (this._dragState.isDragging)
            return this._dragState.types

        const mimeType = getWellKnownMimeType(event)
        if (mimeType === undefined)
            return this._dragState.types
        if (mimeType === MSIE_MIME_TYPE || mimeType === JSON_MIME_TYPE)
            return
        return [mimeType.substr(CUSTOM_MIME_TYPE.length + 1)] || undefined
    }

    /**
     * Check if external drag.
     */
    public isExternalDrag(): boolean {
        return !this._dragState.isDragging
    }
    private _dragState = new DndStateBuilder().build()
    private _currDragNode = ''
    private _dragElement?: HTMLElement
    /**
     * Store drag images.
     * key: The node's uuid which reference current drag image.
     * value: The drag image templateRef.
     */
    private _dragImages = new Map<string, TemplateRef<unknown>>()
    private _currDropZone?: DropzoneDirective
    private _isDragging = false
    /**
     * Drag ref.
     * key: The node's uuid which reference current drag node.
     * value: The correspond drag directive.
     */
    private _dragRefMap = new Map<string, DraggableDirective>()
    private _onDrop(event: DragEvent): void {
        if (this._currDropZone === undefined)
            return
        const zone = this._currDropZone
        const e = this._currDropZone.onDrop(event)
        if (e === undefined)
            return
        const action = new MoveActionBuilder()
            .target(zone.hostUuid)
            .position(e.index)
            .children(e.data)
            .build()
        this._studioApiSvc.handleAction(action)
    }
}
