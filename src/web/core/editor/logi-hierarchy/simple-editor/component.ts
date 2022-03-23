import {DOCUMENT} from '@angular/common'
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
} from '@angular/core'
import {assertIsString} from '@logi/base/ts/common/assert'
import {FormulaBearer, isNode, SliceExpr} from '@logi/src/lib/hierarchy/core'
import {
    ClickPanelEvent,
    DirectiveResponse,
    DirectiveType,
    DisplayResponse,
    EditorDisplayUnit,
    EditorInitialEventBuilder,
    EditorKeyboardEvent,
    EditorLocationBuilder,
    EditorMouseEventBuilder,
    Event as EditorEvent,
    isDirectiveResponse,
    isEditorResponse,
    isFuncHelperResponse,
    isPanelResponse,
    Location,
    UnitType,
} from '@logi/src/lib/intellisense'
import {getUnitClass} from '@logi/src/lib/visualizer'
import {getCaretOffsetInPx, getCharOffset} from '@logi/src/web/base/editor'
import {isHTMLElement} from '@logi/src/web/base/utils'
import {SimpleEditor} from '@logi/src/web/core/editor/logi-hierarchy/base'
import {
    TooltipService,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor/tooltip'
import {
    NodeFocusInfoBuilder,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {fromEvent, merge, Observable, Subject, Subscription} from 'rxjs'
import {
    concatAll,
    filter,
    map,
    take,
    takeUntil,
    throttleTime,
} from 'rxjs/operators'

import {
    createBlurEvent,
    createCompositionEvent,
    createInputEvent,
    createKeyEvent,
    createPasteEvent,
    Editor,
    EditorBuilder,
} from './editor_base'
import {FunctionHelperService} from './function-helper'
import {PanelDataBuilder, SuggestionPanelService} from './suggestion-panel'
import {UnitPanelService} from './unit-panel'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '[attr.spellcheck]': 'false',
    },
    selector: 'logi-simple-editor',
    styleUrls: ['./style.scss', './unit_style.scss'],
    templateUrl: './template.html',
})
export class SimpleEditorComponent extends SimpleEditor
    implements OnDestroy, OnInit, OnChanges {
    public constructor(

        @Inject(DOCUMENT)
        /**
         * Using `Document` type for `_document` will get an error in angular 5
         * See: https://github.com/angular/angular/issues/20351#issuecomment-446025223.
         *
         * Now in angular 9, replacing `any` with `Document` will not get error.
         * TODO (kai): Confirm that no error would be thrown in angular 9.
         */
        // tslint:disable-next-line: unknown-instead-of-any
        private readonly _document: any,
        private readonly _editorContainer: ElementRef<HTMLDivElement>,
        private readonly _functionHelperSvc: FunctionHelperService,
        private readonly _render2: Renderer2,
        private readonly _suggestionPanelSvc: SuggestionPanelService,
        private readonly _tooltipSvc: TooltipService,
        private readonly _unitPanelSvc: UnitPanelService,
        // tslint:disable-next-line: ter-max-len
        // tslint:disable-next-line: codelyzer-template-property-should-be-public
        public readonly injector: Injector,
    ) {
        super(injector)
        this._response$ = this._studioApiSvc.connect(this._editorEvent$)
    }

    @Input() public node!: Readonly<FormulaBearer>
    @Input() public sliceExpr?: Readonly<SliceExpr>

    @Output() public readonly blur$ = new EventEmitter()
    @Output() public readonly focus$ = new EventEmitter<MouseEvent>()
    @Output() public readonly mousedown$ = new EventEmitter<MouseEvent>()

    // tslint:disable-next-line: ng-no-simplechange-in-ngonchange
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.node === undefined || changes.node.isFirstChange())
            return
        const oldNode = changes.sliceExpr?.previousValue !== undefined ?
            changes.sliceExpr.previousValue : changes.node.previousValue
        const oldExpr = oldNode.expression
        this.node = changes.node.currentValue
        if (changes.sliceExpr !== undefined)
            this.sliceExpr = changes.sliceExpr.currentValue
        const newNode = this.sliceExpr !== undefined ?
            this.sliceExpr : this.node
        const newExpr = newNode.expression
        if (oldExpr !== newExpr)
            this._initContent()
    }

    public ngOnInit(): void {
        this._editor = new EditorBuilder()
            .container(this._editorContainer.nativeElement)
            .build()
        this.expression = this.sliceExpr ? this.sliceExpr.expression :
            this.node.expression
        this._subs.add(this._response$
            .pipe(concatAll())
            .subscribe(this._handleResponse.bind(this)))
        /**
         * Subscribe editor dom event and send to controller.
         */
        this._subscribeDomEvent()
        /**
         * Initialize content of editor container dom element.
         */
        this._initContent()
    }

    public ngOnDestroy(): void {
        this._destroyed$.next()
        this._destroyed$.complete()
        this._subs.unsubscribe()
    }

    private _editor!: Editor
    private _editorEvent$ = new Subject<EditorEvent>()
    private _response$: Observable<Observable<DisplayResponse>>
    /**
     * Display units parsed by controller.
     */
    private _units: readonly EditorDisplayUnit[] = []
    private _startOffset = -1
    private _endOffset = -1

    private _destroyed$ = new Subject<void>()
    /**
     * Whether this editor is being focused.
     */
    private _focused = false
    private _mousemoveSub?: Subscription
    private _mouseupSub?: Subscription
    private _subs = new Subscription()

    /**
     * TODO (kai): Move this to `Editor`.
     */
    // tslint:disable-next-line: max-func-body-length
    private _subscribeDomEvent(): void {
        const editor = this._editor
        this._subs.add(merge<EditorEvent>(
            // tslint:disable-next-line: no-type-assertion
            editor.keydown$().pipe(map(createKeyEvent), filter((
                e: EditorKeyboardEvent | undefined,
            ): boolean => e !== undefined)) as Observable<EditorKeyboardEvent>,
            editor.input$().pipe(map(createInputEvent)),
            editor.compositionstart$().pipe(map(createCompositionEvent)),
            editor.compositionupdate$().pipe(map(createCompositionEvent)),
            editor.compositionend$().pipe(map(createCompositionEvent)),
        ).subscribe((e: EditorEvent): void => this._sendEvent(e)))

        this._subs.add(editor.mousedown$().subscribe((e: MouseEvent): void => {
            /**
             * TODO(minglong):
             * The node focus relative codes below should be combine with
             * node-focus directive event listen.
             */
            const info = new NodeFocusInfoBuilder()
                .nodeId(this.node.uuid)
                .slice(this.sliceExpr)
                .focusType(this.focusType.EXPRESSION)
                .build()
            if (e.ctrlKey || !this.nodeFocusSvc.isInfoFocus(info))
                return
            /**
             * If node or slice has not been selected, should not focus name,
             * expression or stub.
             */
            if (!this.nodeFocusSvc.isSelected(this.node.uuid) &&
                !this.nodeFocusSvc.isSelected(this.node.uuid, this.sliceExpr))
                return
            this.mousedown$.next(e)
            const editable = this._editorContainer.nativeElement
                .getAttribute('contenteditable')
            if (editable === null || editable === 'false')
                return
            this._focused = true
            this._startOffset = getCharOffset(e)

            const time = 100
            this._mousemoveSub = editor
                .mousemove$()
                .pipe(throttleTime(time), takeUntil(this.blur$))
                .subscribe((me: MouseEvent): void => {
                    this._endOffset = getCharOffset(me)
                })
            /**
             * After mousedown on editor container, mouseup event may occur on
             * any other element of document.
             */
            this._mouseupSub = fromEvent<MouseEvent>(this._document, 'mouseup')
                .pipe(take(1))
                .subscribe((me: MouseEvent): void => {
                    this._mouseUpEvent(me)
                })
        }))

        this._subs.add(editor.mouseover$().subscribe((e: MouseEvent): void => {
            const element = e.target
            if (!isHTMLElement(element))
                return
            this._showHoverMessage(element)
            this._setNodeJumpStyle(e)
        }))

        this._subs.add(editor.mouseout$().subscribe((): void => {
            this._unitPanelSvc.closePanel()
            this._tooltipSvc.hide()
        }))

        this._subs.add(editor.focus$().subscribe((): void => {
            this.focus$.next()
            if (this._focused)
                return
            /**
             * Always set cursor to the end when focus.
             */
            let offset = 0
            this._units.forEach(u => {
                offset += u.content.length
            })
            const event = new EditorMouseEventBuilder()
                .location(new EditorLocationBuilder()
                    .loc(Location.RIGHT)
                    .node(this.node)
                    .sliceExpr(this.sliceExpr)
                    .build())
                .leftButton(true)
                .endOffset(offset)
                .startOffset(offset)
                .editorText(this._units)
                .build()
            this._sendEvent(event)
        }))

        /**
         * When losing focus on this editor, send an event to controller and
         * update expression.
         */
        this._subs.add(editor.blur$().subscribe((): void => {
            this.blur$.next()
            this._focused = false
            this._mouseupSub?.unsubscribe()
            this._mousemoveSub?.unsubscribe()
            this._sendEvent(
                createBlurEvent(this.node, this._units, this.sliceExpr),
            )
            this.updateExpression()
        }))

        /**
         * Listen paste event from clipboard like ctrl+v, send paste event to
         * controller to support paste function in simple-editor.
         */
        this._subs.add(editor.paste$().subscribe((e: ClipboardEvent): void => {
            const event = createPasteEvent(e)
            this._sendEvent(event)
        }))
    }

    private _mouseUpEvent(me: MouseEvent): void {
        this._mouseupSub?.unsubscribe()
        this._mousemoveSub?.unsubscribe()
        // tslint:disable-next-line: no-type-assertion
        const target = me.target as HTMLElement
        if (this._editorContainer.nativeElement.contains(target))
            this._endOffset = getCharOffset(me)

        if (this._endOffset < 0 || this._startOffset < 0)
            return
        const event = new EditorMouseEventBuilder()
            .location(new EditorLocationBuilder()
                .loc(Location.RIGHT)
                .node(this.node)
                .sliceExpr(this.sliceExpr)
                .build())
            .leftButton(true)
            .ctrlKey(me.ctrlKey)
            .endOffset(this._endOffset)
            .startOffset(this._startOffset)
            .editorText(this._units)
            .build()
        this._sendEvent(event)
    }

    // tslint:disable-next-line: max-func-body-length
    private _handleResponse(response: DisplayResponse): void {
        if (isEditorResponse(response)) {
            const editorResp = response
            this._units = editorResp.content
            this.expression = editorResp.getExpression()
            this._editor.renderContent(editorResp.content)
            this._editor.setElementRange(
                editorResp.startOffset,
                editorResp.endOffset,
            )
            this._functionHelperSvc.hide()
        } else if (isPanelResponse(response)) {
            const tab = response.tab
            const items = tab.items
            const container = this._editorContainer.nativeElement

            /**
             * Open suggestion panel.
             */
            if (items.length !== 0) {
                const panelData = new PanelDataBuilder()
                    .items(items)
                    .selectedIndex(tab.selected)
                    .offset(getCaretOffsetInPx())
                    .build()
                if (this._suggestionPanelSvc.isPanelOpen())
                    this._suggestionPanelSvc.updatePanel(panelData)
                // tslint:disable-next-line: brace-style
                else {
                    this._suggestionPanelSvc.openPanel(container, panelData)
                    /**
                     * Listen panel click event(mousedown event actually).
                     * When click on panel, the event stream is:
                     *     1. mousedown (panel)
                     *     2. blur (editor container)
                     *     3. mouseup (panel)
                     * Now controller will skip the blur event after mousedown
                     * on panel.
                     */
                    // tslint:disable: limit-indent-for-method-in-class
                    this._subs
                        .add(this._suggestionPanelSvc.panelClick()?.subscribe(
                            (event: ClickPanelEvent): void =>
                                this._sendEvent(event),
                        ),)
                }
            } else
                /**
                 * Close suggestion panel.
                 */
                this._suggestionPanelSvc.closePanel()
            this._functionHelperSvc.hide()
        } else if (isDirectiveResponse(response)) {
            this._onDirectiveResp(response)
            this._functionHelperSvc.hide()
        } else if (isFuncHelperResponse(response)) {
            const index = response.imageIndex + 1
            const attachedElement = getAttachedElementFromUnitIndex(
                this._editorContainer.nativeElement,
                index,
            )
            const elementRef = new ElementRef(attachedElement)
            this._functionHelperSvc.show(elementRef, response)
        }
    }

    // tslint:disable-next-line: max-func-body-length
    private _onDirectiveResp(directiveResp: Readonly<DirectiveResponse>): void {
        switch (directiveResp.directive) {
        case DirectiveType.SKIP_BACK:
            this.nodeFocusSvc.horizontalRightFocus()
            break
        /**
         * Jump to last simple editor.
         */
        case DirectiveType.SKIP_LAST:
            this.nodeFocusSvc.focusLastNode()
            break
        /**
         * Jump to next simple editor.
         */
        case DirectiveType.SKIP_NEXT:
            this.nodeFocusSvc.focusNextNode()
            break
        /**
         * Listen esc.
         */
        case DirectiveType.BLUR:
            this._editorContainer.nativeElement.blur()
            break
        /**
         * ctrl+c
         */
        case DirectiveType.COPY:
            if (directiveResp.data === undefined)
                return
            assertIsString(directiveResp.data)
            this._document.execCommand('copy')
            break
        /**
         * ctrl+v
         */
        case DirectiveType.CUT:
            if (directiveResp.data === undefined)
                return
            assertIsString(directiveResp.data)
            this._document.execCommand('cut')
            break
        case DirectiveType.NONE:
            break
        case DirectiveType.SAVE:
            break
        /**
         * ctrl+left mouse down
         */
        case DirectiveType.TRACE:
            if (directiveResp.data === undefined)
                return
            const targets = directiveResp.data
            if (targets.length === 0)
                return
            const target = targets[0]
            if (!isNode(target))
                return
            const config = new SelConfigBuilder()
                .multiSelect(false)
                .scrollIntoView(true)
                .isExpand(true)
                .build()
            this.nodeFocusSvc.setSelNodes([target.uuid], undefined, config)
            break
        default:
        }
    }

    private _initContent(): void {
        const expression = this.sliceExpr ? this.sliceExpr.expression :
            this.node.expression
        const initialEvent = new EditorInitialEventBuilder()
            .expression(expression)
            .loc(new EditorLocationBuilder()
                .loc(Location.RIGHT)
                .node(this.node)
                .sliceExpr(this.sliceExpr)
                .build())
            .build()
        this._sendEvent(initialEvent)
    }

    private _sendEvent(event: EditorEvent): void {
        this._unitPanelSvc.closePanel()
        this._editorEvent$.next(event)
    }

    private _showHoverMessage(element: HTMLElement): void {
        const index = getUnitIndexFromEventTarget(
            this._editorContainer.nativeElement,
            element,
            'data-index',
        )
        if (index === undefined)
            return
        const unit = this._units[index]
        if (unit === undefined || unit.hoverInfo.message.trim().length === 0)
            return
        if (this._unitPanelSvc.hasAttached(element))
            return
        this._unitPanelSvc.openPanel(element, unit.hoverInfo)
    }

    /**
     * When mouse over reference display unit with Ctrl key pressed, it should
     * have an underline style.
     */
    private _setNodeJumpStyle(e: MouseEvent): void {
        const el = e.target
        if (!isHTMLElement(el))
            return
        if (!e.ctrlKey)
            return
        const relative = e.relatedTarget
        const traceHintClass = getUnitClass(UnitType.TRACE_HINT)
        if (traceHintClass === undefined)
            return
        /**
         * In `unit_style.scss`, the class of trace hint hover style is
         * '.t-trace-hint.hover'.
         */
        const hoverClass = 'hover'
        if (relative !== null)
            this._render2.removeClass(relative, hoverClass)
        if (!el.classList.contains(traceHintClass))
            return
        this._render2.addClass(el, hoverClass)
    }
// tslint:disable: max-file-line-count
}

/**
 * Get the display unit stored in `data-index` attribute of unit span element.
 */
function getUnitIndexFromEventTarget(
    container: HTMLElement,
    target: HTMLElement,
    attribute: string,
): number | undefined {
    let element: HTMLElement | null = target
    while (element !== null && element instanceof HTMLElement &&
        element !== container) {
        const index = element.getAttribute(attribute)
        if (index !== null && !isNaN(Number(index)))
            return Number(index)
        element = element.parentElement
    }
    return
}

function getAttachedElementFromUnitIndex(
    container: HTMLElement,
    index: number,
): HTMLElement {
    const child = container.childNodes[index]
    if (!isHTMLElement(child))
        return container
    return child
}
