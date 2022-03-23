import {
  AfterViewInit,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core'
import {NodeType} from '@logi/src/lib/hierarchy/core'

import {DndService as DragRefService} from './drag_ref'
import {EffectAllowed} from './types'
import {
  DndDropEvent,
  DndDropEventBuilder,
  DndEvent,
  getDirectChildElement,
  shouldPositionPlaceholderBeforeElement,
} from './utils'

@Directive({
    selector: '[logi-dnd-placeholder]',
})
/**
 * place holder directive.
 */
export class PlaceholderRefDirective {
    public constructor(public readonly elRef: ElementRef) {}
}

@Directive({
    selector: '[logi-dnd-dropzone]',
})
/**
 * drop zone directive.
 */
export class DropzoneDirective implements AfterViewInit, OnDestroy {
    @Input() public set dndDisableIf(value: boolean) {
        this._disabled = value
        if (this._disabled)
            this._renderer.addClass(
                this._elRef.nativeElement,
                this.dndDropzoneDisabledClass,
            )
        else
            this._renderer.removeClass(
                this._elRef.nativeElement,
                this.dndDropzoneDisabledClass,
            )
    }

    @Input() public set dndDisableDropIf(value: boolean) {
        this.dndDisableIf = value
    }
    public constructor(
        private readonly _elRef: ElementRef<HTMLDivElement>,
        private readonly _renderer: Renderer2,
        private readonly _dragRefSvc: DragRefService,
    ) {}
    public placeholder?: Element
    @Input() public hostUuid = ''
    /**
     * Determine which nodes can be dropped in. If not set, all nodes can be
     * dropped in.
     */
    @Input() public dndDropZone: readonly string[] = []
    @Input() public dndEffectAllowed!: EffectAllowed
    @Input() public dndAllowExternal = false
    @Input() public dndHorizontal = false
    @Input() public dndDragoveClass = 'dndDragover'
    @Input() public dndDropzoneDisabledClass = 'dndDropzoneDisabled'
    @Output() public readonly dndDragover$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndDrop$ = new EventEmitter<DndDropEvent>()
    @HostListener('dragover', ['$event'])
    public readonly dragOverEventHandler: (event: DragEvent) => void = (
        event: DragEvent,
    ) => this.onDragOver(event)
    @HostListener('dragleave', ['$event'])
    public readonly dragLeaveEventHandler: (event: DragEvent) => void = (
        event: DragEvent,
    ) => this.onDragLeave(event)
    @HostListener('dragenter', ['$event'])
    public readonly dragEnterEventHandler: (event: DragEvent) => void = (
        event: DragEvent,
    ) => this.onDragEnter(event)
    public ngAfterViewInit(): void {
        const placeholder = this._tryGetPlaceholder()
        if (placeholder === undefined)
            return
        this.placeholder = placeholder
        this._removePlaceholderFromDom()
    }

    public ngOnDestroy(): void {
        this._elRef.nativeElement
            .removeEventListener('dragenter', this.dragEnterEventHandler)
        this._elRef.nativeElement
            .removeEventListener('dragover', this.dragOverEventHandler)
        this._elRef.nativeElement
            .removeEventListener('dragleave', this.dragLeaveEventHandler)
    }

    /**
     * Handle drag enter.
     */
    public onDragEnter(event: DndEvent): void {
        // check if another dropzone is activated
        if (event.dndDropzoneActive) {
            this.cleanupDragoverState()
            return
        }
        if (event.dndDropzoneActive === undefined) {
            const newTarget = document
                .elementFromPoint(event.clientX, event.clientY)
            if (this._elRef.nativeElement.contains(newTarget))
                event.dndDropzoneActive = true
        }
        const types = this._dragRefSvc.getDndType(event)
        if (types === undefined)
            return
        if (!this._isDropAllowed(types))
            return
        // allow the dragenter
        event.preventDefault()
    }

    /**
     * Handle drag over.
     */
    public onDragOver(event: DragEvent): void {
        event.stopImmediatePropagation()
        event.stopPropagation()
        /**
         * With nested dropzones, we want to ignore this event if a child
         * dropzone has already handled a dragover. Historically,
         * event.stopPropagation() was used to prevent this bubbling, but
         * that prevents any dragovers outside the ngx-drag-drop component,
         * and stops other use cases such as scrolling on drag. Instead, we
         * can check if the event was already prevented by a child and bail
         * early.
         * https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome
         */
        if (event.defaultPrevented)
            return
        // check if this drag event is allowed to drop on this dropzone
        const types = this._dragRefSvc.getDndType(event)
        if (types === undefined)
            return
        if (!this._isDropAllowed(types))
            return
        this._checkAndUpdatePlaceholderPosition(event)
        this._dragRefSvc.setCurrDropZone(this)
        // allow the dragover
        event.preventDefault()
        this.dndDragover$.emit(event)
        this._renderer.addClass(this._elRef.nativeElement, this.dndDragoveClass)
    }

    /**
     * Handle drop.
     *
     * Do not listen `drop` event instead of listen `dragend` event for `drop`
     * event can not trigger immediately in chrome.
     * It is maybe not neccesary to know about why, just transfer data by
     * custom service.
     */
    public onDrop(event: DragEvent): DndDropEvent | undefined {
        const e = this._dropProcess(event)
        this.cleanupDragoverState()
        this._dragRefSvc.setCurrDropZone()
        const ph = document.querySelector('drop-placeholder')
        if (ph !== null) {
            // tslint:disable-next-line: no-type-assertion
            const elm = ph as HTMLElement
            elm.style.setProperty('display', 'none')
        }
        return e
    }

    /**
     * Handle drag leave.
     */
    public onDragLeave(event: DndEvent): void {
        event.preventDefault()
        event.stopPropagation()
        /**
         * check if still inside this dropzone and not yet handled by another
         * dropzone
         */
        if (event.dndDropzoneActive === undefined) {
            const newTarget = document
                .elementFromPoint(event.clientX, event.clientY)
            if (this._elRef.nativeElement.contains(newTarget)) {
                event.dndDropzoneActive = true
                return
            }
        }
        // cleanup drop effect when leaving dropzone
        this._dragRefSvc.setDropEffect(event, 'none')
    }

    public cleanupDragoverState(): void {
        this._renderer
            .removeClass(this._elRef.nativeElement, this.dndDragoveClass)
        this._removePlaceholderFromDom()
    }

    /**
     * public only for test
     */
    public isContain(): boolean {
        const elem = this._dragRefSvc.getDragElement()
        if (elem?.contains(this._elRef.nativeElement))
            return true
        return false
    }

    @ContentChild(PlaceholderRefDirective)
    private readonly _dndPlaceholderRef!: PlaceholderRefDirective
    private _disabled = false

    private _dropProcess(event: DragEvent): DndDropEvent | undefined {
        // check if this drag event is allowed to drop on this dropzone
        const types = this._dragRefSvc.getDndType(event)
        if (types === undefined)
            return
        if (!this._isDropAllowed(types))
            return
        event.preventDefault()
        const dropEffect = this._dragRefSvc.getDropEffect(event)
        this._dragRefSvc.setDropEffect(event, dropEffect)
        if (dropEffect === 'none')
            return
        const dropIndex = this._getPlaceholderIndex()
        if (dropIndex === -1)
            return
        const data = this._dragRefSvc.getDragNodes()
        const dropEvent = new DndDropEventBuilder()
            .event(event)
            .dropEffect(dropEffect)
            .isExternal(this._dragRefSvc.isExternalDrag())
            .data(data)
            .index(dropIndex)
            .type(types)
            .build()
        this.dndDrop$.emit(dropEvent)
        event.stopPropagation()
        return dropEvent
    }

    private _tryGetPlaceholder(): Element | undefined {
        if (this._dndPlaceholderRef !== undefined)
            return this._dndPlaceholderRef.elRef.nativeElement
        const el = this._elRef.nativeElement
            .querySelector('[logi-dnd-placeholder]')
        if (el !== null)
            return el
        return
    }

    private _isDropAllowed(types: readonly string[]): boolean {
        if (this.isContain())
            return false
        if (this._disabled)
            return false
        /**
         * if drag did not start from our directive and external drag sources
         * are not allowed -> deny it
         */
        if (this._dragRefSvc.isExternalDrag() && !this.dndAllowExternal)
            return false
        /**
         * no filtering by types -> allow it
         */
        if (this.dndDropZone.length === 0)
            return true
        let res
        types.forEach((type: string): void => {
            /**
             * no type set -> allow it
             */
            if (type === NodeType.TYPE_UNSPECIFIED.toString())
                res = true
        })
        if (res !== undefined)
            return res
        if (!Array.isArray(this.dndDropZone))
            // tslint:disable-next-line: no-throw-unless-asserts
            throw new Error(
                `logi-dnd-dropzone: bound value to [logi-dnd-dropzone] must be
                an array`,
            )

        let result
        types.forEach((type: string): void => {
            if (this.dndDropZone.indexOf(type) !== -1)
                result = true
        })
        if (result !== undefined)
            return result
        return false
    }

    private _checkAndUpdatePlaceholderPosition(event: DragEvent): void {
        if (this.placeholder === undefined)
            return
        /**
         * make sure the placeholder is in the DOM.
         */
        if (this.placeholder.parentNode !== this._elRef.nativeElement)
            this._renderer
                .appendChild(this._elRef.nativeElement, this.placeholder)
        /**
         * update the position if the event originates from a child element
         * of the dropzone
         */
        const directChild = getDirectChildElement(
            this._elRef.nativeElement,
            // tslint:disable-next-line: no-type-assertion
            event.target as Element,
        )

        // early exit if no direct child or direct child is placeholder
        if (directChild === undefined
          || directChild === this.placeholder)
            return
        const positionPlaceholderBeforeDirectChild
            = shouldPositionPlaceholderBeforeElement(
                event,
                directChild,
                this.dndHorizontal,
            )
        if (positionPlaceholderBeforeDirectChild) {
            // do insert before only if necessary
            if (directChild.previousSibling !== this.placeholder)
                this._renderer.insertBefore(
                    this._elRef.nativeElement,
                    this.placeholder,
                    directChild,
                )
        } else if (directChild.nextSibling !== this.placeholder)
            // do insert after only if necessary
            this._renderer.insertBefore(
                this._elRef.nativeElement,
                this.placeholder,
                directChild.nextSibling,
            )
    }

    private _removePlaceholderFromDom(): void {
        const parent = this.placeholder?.parentNode
        if (this.placeholder === undefined || parent === null
            || parent === undefined)
            return
        parent.removeChild(this.placeholder)
    }

    private _getPlaceholderIndex(): number {
        if (this.placeholder === undefined)
            return -1
        const element = this._elRef.nativeElement
        if (element.children.length === 0)
            return 0
        return Array.from(element.children).indexOf(this.placeholder)
    }
}
