import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Injector,
    Input,
    OnDestroy,
    Renderer2,
    ViewChild,
    ViewContainerRef,
} from '@angular/core'
import {
    Node,
    NodeType,
    Sheet as HierarchySheet,
} from '@logi/src/lib/hierarchy/core'
import {isHTMLElement} from '@logi/src/web/base/utils'
import {
    ContextMenuComponent,
    ContextMenuItem,
    ContextMenuService,
} from '@logi/src/web/common/context-menu'
import {
    ContextMenuActionService,
} from '@logi/src/web/core/editor/contextmenu-action'
import {AddType, Sheet} from '@logi/src/web/core/editor/logi-hierarchy/base'
import {fromEvent} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-editor-sheet',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SheetComponent extends Sheet implements AfterViewInit, OnDestroy {
    public constructor(
        private readonly _contextMenuActionSvc: ContextMenuActionService,
        private readonly _contextMenuSvc: ContextMenuService,
        private readonly _el: ElementRef<HTMLElement>,
        private readonly _render: Renderer2,
        private readonly _viewContainerRef: ViewContainerRef,
        public readonly injector: Injector,
    ) {
        super(injector)
    }

    @Input() public node!: Readonly<HierarchySheet>
    public blockList = [AddType.TITLE, AddType.TABLE, AddType.TEMPALTE] as const
    public dropZone: ReadonlyArray<string> = [NodeType.TABLE
        .toString(), NodeType.TITLE.toString()]
    @ViewChild('container', {static: true})
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public container!: ElementRef<HTMLDivElement>

    public contextMenuActions: readonly ContextMenuItem[] = []
    public subMenuActions: readonly ContextMenuItem[] = []

    public ngAfterViewInit (): void {
        this._listenContextmenu()
    }

    /**
     * When the container of the previous table suddenly becomes shorter,
     * the scroll event will not trigger,
     * then the table-sticky-change class will never add
     */
    @HostListener('scroll')
    public onScroll (): void {
        const sheetPos = this._el.nativeElement.getBoundingClientRect().top
        const tableEls = this._el.nativeElement
            .querySelectorAll('.table-block-title')
        tableEls.forEach((el: Element): void => {
            const position = el.getBoundingClientRect()
            if (position.top === sheetPos)
                this._render.addClass(el, 'table-sticky-change')
            else
                this._render.removeClass(el, 'table-sticky-change')
        })
    }

    public ngOnDestroy (): void {
        this.destroyed$.next()
        this.destroyed$.complete()
    }

    @ViewChild(ContextMenuComponent)
    private readonly _contextmenu!: ContextMenuComponent

    private _listenContextmenu (): void {
        fromEvent<MouseEvent>(this._el.nativeElement, 'contextmenu')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((e: MouseEvent): void => {
                e.preventDefault()
                e.stopPropagation()
                if (!isHTMLElement(e.target) || this.readonly)
                    return
                const nodeId = this._getNodeIdFromEventTarget(e.target)
                if (nodeId === undefined)
                    return
                const selectedIds = this.nodeFocusSvc
                    .getSelNodes()
                    .map((node: Readonly<Node>): string => node.uuid)
                if (!selectedIds.includes(nodeId))
                    return
                this.contextMenuActions = this._contextMenuActionSvc
                    .getActions(false, this._viewContainerRef)
                this.subMenuActions = this._contextMenuActionSvc.getSubActions()
                /**
                 * If not trigger change detection, it will not show contextmenu
                 * view at first time because the `contextMenuActions` is
                 * provided dynamically.
                 */
                this.cd.detectChanges()
                this._contextMenuSvc.show.next({
                    contextMenu: this._contextmenu,
                    event: e,
                    item: {},
                })
            })
    }

    private _getNodeIdFromEventTarget (target: HTMLElement): string | undefined {
        let element: HTMLElement | null = target
        while (element !== null && element instanceof HTMLElement &&
            element !== this._el.nativeElement) {
            const nodeId = element.getAttribute('data-node')
            if (nodeId !== null && nodeId.length !== 0)
                return nodeId
            element = element.parentElement
        }
        return
    }
}
