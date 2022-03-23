// tslint:disable: max-file-line-count
import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
} from '@angular/core'
import {isNumPad, KeyboardEventCode} from '@logi/base/ts/common/key_code'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    getNodesVisitor,
    isFormulaBearer,
    Node,
    NodeType,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'
import {Button} from '@logi/src/web/base/mouse'
import {fromEvent, Observable, Subject, Subscription, timer} from 'rxjs'

import {
    FocusConfigBuilder,
    FocusType,
    NodeFocusInfo,
    NodeFocusInfoBuilder,
    SelConfigBuilder,
} from './define'
import {keyboradAltEvent, keyboradCtrlEvent} from './keyboard_handler'
import {NodeFocusService} from './service'

/**
 * EXPORT ONLY FOR TEST
 */
export const SELECT_CLASS_NAME = 'selected'
export const NAME_FOCUS_CLASS_NAME = 'name-focused'
const EXPR_FOCUS_CLASS_NAME = 'expr-focused'
const STUB_FOCUS_CLASS_NAME = 'stub-focused'
const DRAG_CLASS_NAME = 'dragging-elements-fade-away'
const CUT_CLASS_NAME = 'cutting-nodes'

@Directive({
    selector: '[logi-node-focusable]',
})
export class NodeFocusableDirective implements
    OnInit, OnDestroy, AfterViewInit {
    private get _target(): HTMLElement {
        return this.styleTarget ?? this._element
    }
    public constructor(
        private readonly _svc: NodeFocusService,
        private readonly _render2: Renderer2,
        private readonly _el: ElementRef,
    ) {
        this._element = this._el.nativeElement
    }
    @Input() public node!: Readonly<Node>
    @Input() public sliceExpr?: Readonly<SliceExpr>
    @Input() public readonly = false
    @Input() public focusType: FocusType = FocusType.CONTAINER
    /**
     * The target element that should be styled. If it is undefined, then
     * styling the host element.
     */
    @Input() public styleTarget?: HTMLElement
    /**
     * The target element that should be called event. If it is undefined, then
     * listen the host element.
     */
    @Input() public eventTarget?: HTMLElement
    public id = ''

    public ngOnInit(): void {
        this.id = `${this.node.uuid}${this.focusType}`
        if (this.sliceExpr !== undefined && isFormulaBearer(this.node))
            this.id += this.node.sliceExprs.indexOf(this.sliceExpr)
        this._svc.registry(this)
        this._hostListen()
        this._render2.setAttribute(this._element, 'contenteditable', 'false')
        this._render2.setAttribute(this._element, 'readonly', 'true')
    }

    public ngAfterViewInit(): void {
        const info = this._getFocusInfo()
        if (!this._svc.isInfoFocus(info))
            return
        const c = new FocusConfigBuilder().focus(true).build()
        this._svc.setFocus(info, c)
        if (this._svc.isSelected(this.node.uuid)
            || !this._svc.isSelected(this.node.uuid, this.sliceExpr))
            return
        this._svc.setSelInfos(
            [new NodeFocusInfoBuilder().nodeId(this.node.uuid).build()],
        )
    }

    public ngOnDestroy(): void {
        this._svc.unregistry(this)
        this._subs.unsubscribe()
        this._destroy$.next()
        this._destroy$.complete()
    }

    /**
     * should only be called by nodeFocusService.
     * NOTE: only service can call this function
     */
    public setSelect(isSelect: boolean): void {
        if (this.focusType !== FocusType.CONTAINER)
            return
        isSelect ? this._render2.addClass(this._target, SELECT_CLASS_NAME) :
            this._render2.removeClass(this._target, SELECT_CLASS_NAME)
        isSelect ? this._render2.addClass(this._element, SELECT_CLASS_NAME) :
            this._render2.removeClass(this._element, SELECT_CLASS_NAME)
        this.setDrag(false)
    }

    public hasFocus(): boolean {
        let className = ''
        switch (this.focusType) {
        case FocusType.EXPRESSION:
            className = EXPR_FOCUS_CLASS_NAME
            break
        case FocusType.NAME:
            className = NAME_FOCUS_CLASS_NAME
            break
        case FocusType.STUB:
            className = STUB_FOCUS_CLASS_NAME
            break
        default:
            return false
        }
        return this._target.classList.contains(className)
    }

    /**
     * should only be called by nodeFocusService.
     * NOTE: only service can call this function
     */
    public setFocus(isFocus: boolean): void {
        const focusType = [FocusType.EXPRESSION, FocusType.NAME, FocusType.STUB]
        if (!focusType.includes(this.focusType) || this.readonly)
            return
        let className = ''
        switch (this.focusType) {
        case FocusType.EXPRESSION:
            className = EXPR_FOCUS_CLASS_NAME
            break
        case FocusType.NAME:
            className = NAME_FOCUS_CLASS_NAME
            break
        case FocusType.STUB:
            className = STUB_FOCUS_CLASS_NAME
            break
        default:
        }
        isFocus ? this._render2.addClass(this._target, className) :
            this._render2.removeClass(this._target, className)
        const attr = isFocus ? 'true' : 'false'
        this._render2.setAttribute(this._element, 'contenteditable', attr)
        isFocus ? this._render2.removeAttribute(this._element, 'readonly') :
            this._render2.setAttribute(this._element, 'readonly', 'true')
        if (isFocus && this._disableManualFocus) {
            this._updateDisableManualFocus(false)
            return
        }
        if (!isFocus && this._disableManualBlur) {
            this._updateDisableManualBlur(false)
            return
        }
        timer(0).subscribe(() => {
            isFocus ? this._element.focus() : this._element.blur()
        })
    }

    public setDrag(isDrag: boolean): void {
        if (this.focusType !== FocusType.CONTAINER)
            return
        const bodys = document.querySelectorAll('.mat-tab-body-content')
        bodys.forEach((body: Element): void => {
            if (body.scrollLeft !== undefined && body.scrollLeft > 0)
                body.scrollLeft = 0
            isDrag ? this._render2.addClass(this._target, DRAG_CLASS_NAME) :
                this._render2.removeClass(this._target, DRAG_CLASS_NAME)
        })
    }

    public setCut(): void {
        this._render2.addClass(this._target, CUT_CLASS_NAME)
    }

    public deleteLastCut(): void {
        this._render2.removeClass(this._target, CUT_CLASS_NAME)
    }

    public scrollIntoView(): void {
        const sheet = document.querySelector('logi-editor-sheet')
        const table = document.querySelector('.table-block-title')
        if (sheet === null || table === null)
            return
        const bodyRect = sheet.getBoundingClientRect()
        /**
         * TODO(libiao): find another way to get element total height
         * total height: height + border + margin
         */
        const marginBottom = 7
        const tableHeight = table.getBoundingClientRect().height + marginBottom
        const top = bodyRect.top + tableHeight
        const bottom = bodyRect.bottom
        requestAnimationFrame((): void => {
            const targetRect = this._target.getBoundingClientRect()
            const t = targetRect.top
            const b = targetRect.bottom
            if (t === 0 || b === 0)
                return
            if (t < top) {
                const scroll = sheet.scrollTop - (bodyRect.top - t) -
                    tableHeight
                sheet.scrollTo({top: scroll})
                return
            }
            if (t > top && b < bottom)
                return
            if (b > bottom)
                this._target.scrollIntoView({block: 'end'})
        })
    }

    public updateDisableAutoBlur(disable: boolean): void {
        this._disableAutoBlur = disable
    }

    private _subs = new Subscription()
    private _element: HTMLElement
    private _destroy$ = new Subject<void>()
    private _disableManualBlur = false
    private _disableManualFocus = false
    private _disableAutoBlur = false
    private _updateDisableManualBlur(disable: boolean): void {
        this._disableManualBlur = disable
    }

    private _updateDisableManualFocus(disable: boolean): void {
        this._disableManualFocus = disable
    }

    // tslint:disable-next-line: no-unnecessary-method-declaration
    private _getFocusInfo(): NodeFocusInfo {
        return new NodeFocusInfoBuilder()
            .nodeId(this.node.uuid)
            .slice(this.sliceExpr)
            .focusType(this.focusType)
            .build()
    }

    private _handleDrag(e: MouseEvent): void {
        if (this._svc.isInfoSelected(this._getFocusInfo()))
            return
        const config = new SelConfigBuilder().multiSelect(e.ctrlKey).build()
        this._svc.setSelNodes([this.node.uuid], undefined, config)
    }

    // tslint:disable-next-line: max-func-body-length
    private _hostListen(): void {
        this._subs.add(this._mousedown$().subscribe((e: MouseEvent): void => {
            /**
             * context menu should handle by `contextmenu` event.
             */
            if (e.button === Button.RIGHT)
                return
            if (this.focusType === FocusType.DRAG) {
                this._handleDrag(e)
                e.stopPropagation()
                return
            }
            if (this.focusType === FocusType.CONTAINER) {
                this._handleMouseEvent(e)
                return
            }
            if (e.ctrlKey || this._svc.isInfoFocus(this._getFocusInfo()))
                return
            /**
             * If node or slice has not been selected, should not focus name,
             * expression or stub.
             */
            if (!this._svc.isSelected(this.node.uuid) && !this._svc
                .isSelected(this.node.uuid, this.sliceExpr))
                return
            if (e.isTrusted)
                this._updateDisableManualFocus(true)
            this._svc.setFocus(this._getFocusInfo(), new FocusConfigBuilder()
                .focus(true)
                .manualBlur(true)
                .build(),
            )
        }))
        this._subs.add(this._contextmenu$().subscribe((e: MouseEvent): void => {
            this._contextmenuHandler(e)
            if (this.focusType === FocusType.CONTAINER)
                return
            if (e.isTrusted)
                this._updateDisableManualFocus(true)
            this._svc.setFocus(this._getFocusInfo(), new FocusConfigBuilder()
                .focus(false)
                .manualBlur(true)
                .build(),
            )
        }))
        this._subs.add(this._blur$().subscribe((e: MouseEvent): void => {
            if (this.focusType === FocusType.CONTAINER)
                return
            if (e.isTrusted)
                this._updateDisableManualBlur(true)
            if (this._disableAutoBlur) {
                this.updateDisableAutoBlur(false)
                return
            }
            this._svc.setFocus(
                this._getFocusInfo(),
                new FocusConfigBuilder().focus(false).build(),
            )
        }))
        this._subs.add(this._keydown$().subscribe(e => {
            this._keyboradEventHandler(e)
        }))
    }

    private _contextmenuHandler(e: MouseEvent): void {
        if (this.focusType !== FocusType.CONTAINER)
            return
        if (this._svc.isInfoSelected(this._getFocusInfo()))
            return
        const config = new SelConfigBuilder().multiSelect(e.ctrlKey).build()
        this._svc.setSelInfos([this._getFocusInfo()], undefined, config)
    }

    // tslint:disable-next-line: max-func-body-length
    private _keyboradEventHandler(e: KeyboardEvent): void {
        /**
         * If `NumLock` is off, disable input.
         * https://www.w3schools.com/JSREF/event_key_getmodifierstate.asp
         */
        if (!e.getModifierState('NumLock') && isNumPad(e.code)) {
            e.stopPropagation()
            e.preventDefault()
            return
        }
        keyboradCtrlEvent(e)
        keyboradAltEvent(e)
        const stopPropagation: readonly string[] = [
            KeyboardEventCode.TAB,
            KeyboardEventCode.ARROW_DOWN,
            KeyboardEventCode.ARROW_UP,
            KeyboardEventCode.ENTER,
            KeyboardEventCode.ESCAPE,
            KeyboardEventCode.F2,
        ]
        if (stopPropagation.includes(e.code)) {
            e.stopPropagation()
            e.preventDefault()
        }
        if (this.focusType !== FocusType.NAME)
            return
        switch (e.code) {
        case KeyboardEventCode.TAB:
            this._svc.horizontalRightFocus()
            e.preventDefault()
            break
        case KeyboardEventCode.ARROW_UP:
            this._svc.focusLastNode()
            e.preventDefault()
            break
        case KeyboardEventCode.ARROW_DOWN:
            this._svc.focusNextNode(false)
            e.preventDefault()
            break
        case KeyboardEventCode.ENTER:
            this._svc.focusNextNode()
            e.preventDefault()
            break
        case KeyboardEventCode.ESCAPE:
            if (this.focusType === FocusType.NAME)
                this._element.textContent = this.node.name
            this._svc.cancelFocus()
            e.preventDefault()
            break
        default:
        }
    }

    private _getAllChildren(): readonly Readonly<Node>[] {
        const expetedTypes = [
            NodeType.ROW_BLOCK,
            NodeType.ROW,
            NodeType.COLUMN,
            NodeType.COLUMN_BLOCK,
            NodeType.TITLE,
        ]
        return preOrderWalk(this.node, getNodesVisitor, expetedTypes)
    }

    private _cancelSelParentAndChild(): void {
        const parents = this.node.getAncestors()
        const children = this._getAllChildren()
        parents.concat(children).forEach((n: Readonly<Node>): void => {
            if (n.uuid !== this.node.uuid)
                this._svc.cancelSelect(n.uuid, false)
            if (!isFormulaBearer(n))
                return
            if (this.sliceExpr === undefined)
                n.sliceExprs.forEach(slice => this._svc
                    .cancelSelect(n.uuid, false, slice),
                )
            else
                this._svc.cancelSelect(n.uuid, false)
        })
    }

    // tslint:disable-next-line: max-func-body-length
    private _handleMouseEvent(e: MouseEvent): void {
        if ((this._svc.hasFocus() && e.ctrlKey)
            || this._svc.isDrag(this._getFocusInfo()))
            return
        /**
         * The slice focusable element is in formulabearer focusable element.
         * If not do this, the formula bearer node can be also focused when
         * focusing slice.
         */
        if (this.sliceExpr !== undefined)
            e.stopPropagation()
        /**
         * If ctrl select the selected node, cancel select.
         */
        if (this._svc.isSelected(this.node.uuid, this.sliceExpr) && e.ctrlKey) {
            this._svc.cancelSelect(this.node.uuid, true, this.sliceExpr)
            return
        }
        /**
         * Cancel focused state of current node's parents and children when
         * click with ctrl key pressed.
         */
        if (e.ctrlKey) {
            this._cancelSelParentAndChild()
            this.sliceExpr === undefined ?
                this._svc.cancelAllSlicesOrNode(true)
                :
                this._svc.cancelAllSlicesOrNode(false)
        }
        if (e.shiftKey && !this._svc
            .isSelected(this.node.uuid, this.sliceExpr)) {
            this._svc.continuousSelect(this.node)
            return
        }
        /**
         * ctrl + click(or mousedown) have another effect. See simple
         * editor trace hint.
         *
         * If the focused element is the mousedown target element, do not
         * do any action for it will make simple editor lose focus after
         * focus spreadjs cell.
         */
        if (this._svc.isSelected(this.node.uuid, this.sliceExpr)) {
            /**
             * If there is select a node (not with ctrl),
             * the previous selection will be cancelled and
             * only the last selected node will be stay
             */
            this.sliceExpr === undefined ?
                this._svc.cancelOtherSel(this.node)
                :
                this._svc.cancelOtherSel(this.sliceExpr)
            return
        }
        const config = new SelConfigBuilder().multiSelect(e.ctrlKey).build()
        this._svc.setSelInfos([this._getFocusInfo()], undefined, config)
    }

    /**
     * Can only listen click for current node, for every input in node also
     * listen click to verify that current node is selected.
     * NOTE: If listen mousedown or other mouse event whose order is behind
     * click, be sure that node's function is correct.
     */
    private _mousedown$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this._element, 'mousedown')
    }

    private _contextmenu$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this._element, 'contextmenu')
    }

    private _blur$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this._element, 'blur')
    }

    private _keydown$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(this._element, 'keydown')
    }
}
