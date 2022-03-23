import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
} from '@angular/core'
import {Node, NodeType} from '@logi/src/lib/hierarchy/core'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api/service'

import {DndService} from './drag_ref'
import {HandleDirective} from './handle.directive'
import {DropEffect, EffectAllowed} from './types'
import {
    calcDragImgOffset,
    DndDragImgOffsetFunction as DndDragImgOffsetFunc,
    DndEvent,
    setDragImg,
} from './utils'

@Directive({
    selector: '[logi-dnd-drag-image-ref]',
})
// tslint:disable-next-line: comment-for-export-and-public
export class DragImgRefDirective implements OnInit {
    public constructor(
        public readonly parent: DraggableDirective,
        // tslint:disable-next-line: unknown-instead-of-any
        public readonly elRef: TemplateRef<any>,
    ) {}
    public ngOnInit(): void {
        const viewRef = this.elRef.createEmbeddedView({})
        /**
         * To make dragImg display full contents.
         */
        // tslint:disable-next-line: ng-markforcheck-instead-of-detectchanges
        viewRef.detectChanges()
        const rootNode = viewRef.rootNodes[0]
        const elementRef = new ElementRef(rootNode)
        this.parent.registerDragImg(elementRef)
    }
}

@Directive({
    selector: '[logi-dnd-draggable]',
})
/**
 * TODO (minglong): Try to use component with transform for drag image, not to
 * use `setDragImage` function.
 */
export class DraggableDirective implements AfterViewInit, OnDestroy {
    @Input() public set dndDisableIf(value: boolean) {
        this.draggable = !value
        if (this.draggable)
            this._renderer.removeClass(
                this._elRef.nativeElement,
                this.dndDraggableDisabledClass,
            )
        else
            this._renderer.addClass(
                this._elRef.nativeElement,
                this.dndDraggableDisabledClass,
            )
    }

    @Input() public set dndDisableDragIf(value: boolean) {
        this.dndDisableIf = value
    }
    public constructor(
        private readonly _elRef: ElementRef<HTMLDivElement>,
        private readonly _renderer: Renderer2,
        private readonly _ngZone: NgZone,
        private readonly _dragRefSvc: DndService,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _studioApiSvc: StudioApiService,
    ) {}
    /**
     * The node's uuid.
     */
    @Input() public dndDraggable!: string
    @Input() public dndEffectAllowed: EffectAllowed = 'move'
    @Input() public dragImage: unknown
    @Input() public dragElement!: HTMLElement
    @Input() public dropzoneElement!: HTMLElement
    /**
     * Use to determine whether can be dropped in `dropZone`.
     */
    @Input() public dndType = NodeType.TYPE_UNSPECIFIED.toString()
    @Input() public dndDropEffect: DropEffect = 'move'
    @Input() public dndDraggingClass = 'dnd-dragging'
    @Input() public dndDraggingSourceClass = 'dndDraggingSource'
    @Input() public dndDraggableDisabledClass = 'dndDraggableDisabled'
    @Input() public dndDragImgOffsetFunc: DndDragImgOffsetFunc
        = calcDragImgOffset
    @Output() public readonly dndStart$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndDrag$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndEnd$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndMoved$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndCopied$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndLinked$ = new EventEmitter<DragEvent>()
    @Output() public readonly dndCanceled$ = new EventEmitter<DragEvent>()
    @HostBinding('attr.draggable') public draggable = true
    // tslint:disable-next-line: max-func-body-length
    @HostListener('dragstart', ['$event'])
    /**
     * When start dragging.
     */
    public onDragStart(event: DndEvent): boolean | void {
        if (!this.draggable)
            return false
        /**
         * Check if there is dnd handle and if the dnd handle was used
         * to start the drag
         */
        if (this._dndHandle !== undefined && event.dndUsingHandle === undefined)
            return false
        this._dragRefSvc.dragStart(this)
        this._nodeFocusSvc.setDragNode()
        this._dragImg = this._determineDragImg()
        /**
         * Set dragging css class prior to setDragImg() so styles are applied
         * before
         */
        this._renderer.addClass(this._dragImg, this.dndDraggingClass)
        if (this._dndDragImgElRef === undefined ||
            event.dndUsingHandle === undefined)
            document.body.appendChild(this._dragImg)
        /**
         * set custom dragimage if present set dragimage if drag is started from
         * dndHandle
         */
        setDragImg(event, this._dragImg, this.dndDragImgOffsetFunc)
        /**
         * add dragging source css class on first drag event
         */
        const unregister = this._renderer
            .listen(this._elRef.nativeElement, 'drag', (): void => {
                this._renderer
                    .addClass(this._elRef.nativeElement, this.dndDraggingClass)
                unregister()
            })

        this.dndStart$.next(event)
        event.stopPropagation()
    }

    @HostListener('dragend', ['$event'])
    /**
     * When drag ends.
     */
    public onDragEnd(event: DragEvent): void {
        this._renderer.removeClass(this._dragImg, this.dndDraggingClass)
        document.body.removeChild(this._dragImg)
        this._dragRefSvc.dragEnd(this, event)
        event.stopPropagation()
    }

    /**
     * Set drag handle.
     */
    public registerDragHandle(handle: HandleDirective): void {
        this._dndHandle = handle
    }

    /**
     * Set drag image.
     */
    public registerDragImg(elRef: ElementRef): void {
        this._dndDragImgElRef = elRef
    }

    public ngAfterViewInit(): void {
        if (!this.dropzoneElement.contains(this.dragElement))
            // tslint:disable-next-line: no-throw-unless-asserts
            throw new Error('error: logi-dnd-dropzone and logi-dnd-draggable should be parent-child relationship')
        this._dragImg = this._determineDragImg()
        this._renderer.addClass(this.dragElement, this.dndDraggingClass)
        this._ngZone.runOutsideAngular((): void => {
            this._elRef.nativeElement
                .addEventListener('drag', this._dragEventHandler)
        })
    }

    public ngOnDestroy(): void {
        this._elRef.nativeElement
            .removeEventListener('drag', this._dragEventHandler)
    }
    private _dndHandle?: HandleDirective
    private _dndDragImgElRef?: ElementRef
    private _dragImg!: Element
    private readonly _dragEventHandler: (event: DragEvent) => void = (
        event: DragEvent,
    ) => this.dndDrag$.emit(event)

    private _determineDragImg(): Element {
        if (this._dndDragImgElRef !== undefined)
            return this._dndDragImgElRef.nativeElement
        const uuids = this._dragRefSvc.getDragNodes()
        const nodes = uuids.reduce(
            (result: Readonly<Node>[], uuid: string): Readonly<Node>[] => {
                const node = this._studioApiSvc.getNode(uuid)
                if (node !== undefined)
                    result.push(node)
                return result
            },
            [],
        )
        let dragNode: Readonly<Node> | undefined
        let currMaxLevel = -1
        nodes.forEach((n: Readonly<Node>): void => {
            const level = PRIORITY.indexOf(n.nodetype)
            if (level < currMaxLevel)
                return
            dragNode = n
            currMaxLevel = level
        })
        if (dragNode === undefined)
            return this._elRef.nativeElement
        const dragImage = this._dragRefSvc.getOrSetDragImages(dragNode.uuid)
        if (dragImage !== undefined) {
            const viewRef = dragImage.createEmbeddedView({})
            // tslint:disable-next-line: ter-max-len
            // tslint:disable-next-line: ng-markforcheck-instead-of-detectchanges
            viewRef.detectChanges()
            const rootNode = viewRef.rootNodes[0]
            return new ElementRef(rootNode).nativeElement
        }
        return this._elRef.nativeElement
    }
}

const PRIORITY: ReadonlyArray<unknown> = [
    NodeType.ROW,
    NodeType.COLUMN,
    NodeType.ROW_BLOCK,
    NodeType.COLUMN_BLOCK,
    NodeType.TABLE,
    NodeType.TITLE,
    NodeType.SHEET,
    NodeType.BOOK,
]
