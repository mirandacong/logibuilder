// tslint:disable: no-type-assertion unknown-instead-of-any
import {
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    ViewChild,
} from '@angular/core'
import {Subscription} from 'rxjs'
import {first} from 'rxjs/operators'

import {
    ContextMenuClickEvent,
    ContextMenuClickEventBuilder,
} from './contextmenu_click_event'
import {ContextMenuItemDirective} from './item.directive'
import {ContextMenuOptions} from './options'
import {
    CloseContextMenuEvent,
    ContextMenuService,
    isPalettePortal,
} from './service'
import {CONTEXT_MENU_OPTIONS} from './tokens'
export interface LinkConfig {
    click(item: any, $event?: MouseEvent): void
    enabled?(item: any): boolean
    html(item: any): string
}
export interface MouseLocation {
    readonly left?: string
    readonly marginLeft?: string
    readonly marginTop?: string
    readonly top?: string
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'logiContextMenu',
    selector: 'logi-context-menu',
    styleUrls: ['./style.scss'],
    template: ' ',
})
export class ContextMenuComponent implements OnDestroy {
    public constructor(
        // tslint:disable-next-line: parameter-properties
        private readonly _contextMenuSvc: ContextMenuService,
        @Optional() @Inject(CONTEXT_MENU_OPTIONS) options: ContextMenuOptions,
    ) {
        if (options) {
            this.autoFocus = options.autoFocus as boolean
            this.useBootstrap4 = options.useBootstrap4 as boolean
        }
        // tslint:disable-next-line: ng-no-subscribe-in-component-constructor
        this._subscription.add(_contextMenuSvc.show.subscribe(menuEvent => {
            this.onMenuEvent(menuEvent)
        }))
    }

    @Input() public menuClass = ''
    @Input() public autoFocus = false
    @Input() public useBootstrap4 = false
    @Input() public disabled = false
    @Output() public readonly close$ = new EventEmitter<CloseContextMenuEvent>()
    @Output() public readonly open$ = new EventEmitter<ContextMenuClickEvent>()
    @ContentChildren(ContextMenuItemDirective)
    public menuItems!: QueryList<ContextMenuItemDirective>
    public visibleMenuItems: readonly ContextMenuItemDirective[] = []

    public links: readonly LinkConfig[] = []
    public item: any
    public event!: MouseEvent | KeyboardEvent
    // tslint:disable-next-line: private-only-viewchild-property
    @ViewChild('menu', {static: false}) public menuElement!: ElementRef

    public ngOnDestroy(): void {
        this._subscription.unsubscribe()
    }

    public onMenuEvent(menuEvent: ContextMenuClickEvent): void {
        if (this.disabled)
            return
        const {contextMenu, event, item}: ContextMenuClickEvent = menuEvent
        if (contextMenu && contextMenu !== this) {
            // @ts-ignore
            if (isPalettePortal(contextMenu[0]))
                this._contextMenuSvc.openPalette(menuEvent)
            return
        }
        this.event = event as MouseEvent | KeyboardEvent
        this.item = item
        this.setVisibleMenuItems()
        const menuClass = menuEvent.parent === undefined ?
            this.menuClass : menuEvent.menuClass
        this._contextMenuSvc.openContextMenu(
            new ContextMenuClickEventBuilder(menuEvent)
                .menuItems(this.visibleMenuItems)
                .menuClass(menuClass)
                .build(),
        )
        this._contextMenuSvc.close
            .asObservable()
            .pipe(first())
            .subscribe((closeEvent: any): void => this.close$.next(closeEvent))
        this.open$.next(menuEvent)
    }

    public isMenuItemVisible(menuItem: ContextMenuItemDirective): boolean {
        return this.evaluateIfFunction(menuItem.visible)
    }

    public setVisibleMenuItems(): void {
        this.visibleMenuItems = this.menuItems.filter(
            menuItem => this.isMenuItemVisible(menuItem),
        )
    }

    public evaluateIfFunction(value: any): any {
        if (value instanceof Function)
            return value(this.item)
        return value
    }
    private _subscription: Subscription = new Subscription()
}
