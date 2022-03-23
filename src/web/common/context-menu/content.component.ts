// tslint:disable: no-type-assertion
// tslint:disable: unknown-instead-of-any
// tslint:disable: codelyzer-template-property-should-be-public
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y'
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core'
import {Subscription} from 'rxjs'

import {ContextMenuClickEvent} from './contextmenu_click_event'
import {ContextMenuItemDirective} from './item.directive'
import {ContextMenuOptions} from './options'
import {CloseLeafMenuEvent} from './service'
import {CONTEXT_MENU_OPTIONS} from './tokens'
export interface LinkConfig {
    click(item: any, $event?: MouseEvent): void
    enabled?(item: any): boolean
    html(item: any): string
}

const ARROW_LEFT_KEYCODE = 37

@Component({
    selector: 'logi-context-menu-content',
    styleUrls: ['./content.style.scss'],
    templateUrl: './content.template.html',
})
export class ContextMenuContentComponent implements OnInit, OnDestroy,
AfterViewInit {
    public constructor(
        @Optional()

        @Inject(CONTEXT_MENU_OPTIONS) options: ContextMenuOptions,
    ) {
        if (options) {
            this.autoFocus = options.autoFocus as boolean
            this.useBootstrap4 = options.useBootstrap4 as boolean
        }
    }
    // tslint:disable-next-line: readonly-array
    @Input() public menuItems: ContextMenuItemDirective[] = []
    // tslint:disable-next-line: unknown-instead-of-any
    @Input() public item: any
    @Input() public event!: MouseEvent | KeyboardEvent
    @Input() public menuClass!: string
    @Output() public readonly execute: EventEmitter<{ event: MouseEvent |
        // tslint:disable-next-line: unknown-instead-of-any
        KeyboardEvent, item: any, menuItem: ContextMenuItemDirective }>
    = new EventEmitter()
    @Output() public readonly openSubMenu: EventEmitter<ContextMenuClickEvent>
    = new EventEmitter()
    @Output() public readonly closeLeafMenu: EventEmitter<CloseLeafMenuEvent>
    = new EventEmitter()
    @Output() public readonly closeAllMenus: EventEmitter<{ event: MouseEvent }>
    = new EventEmitter()
    @Output() public readonly closeSubMenus
        = new EventEmitter<{event: MouseEvent | KeyboardEvent}>()

    public autoFocus = false
    public useBootstrap4 = false

    public ngOnInit(): void {
        // tslint:disable-next-line: unknown-instead-of-any typedef
        this.menuItems.forEach((menuItem: any) => {
            menuItem.currentItem = this.item
            this._subscription.add(menuItem.execute.subscribe(
                // tslint:disable-next-line: unknown-instead-of-any typedef
                (event: any) => this.execute.emit({...event, menuItem}),
            ))
        })
        const queryList = new QueryList<ContextMenuItemDirective>()
        queryList.reset(this.menuItems)
        this._keyManager
        = new ActiveDescendantKeyManager<ContextMenuItemDirective>(queryList)
            .withWrap()
    }

    public ngAfterViewInit(): void {
        if (this.autoFocus)
            // tslint:disable-next-line: no-scheduling-timers
            setTimeout((): void => this.focus())
    }

    public ngOnDestroy(): void {
        this._subscription.unsubscribe()
    }

    public focus(): void {
        if (this.autoFocus)
            this._menuElement.nativeElement.focus()
    }

    // tslint:disable: prefer-function-over-method
    public stopEvent($event: MouseEvent): void {
        $event.stopPropagation()
    }

    public isMenuItemEnabled(menuItem: ContextMenuItemDirective): boolean {
        return this.evaluateIfFunction(menuItem && menuItem.enabled)
    }

    public isMenuItemVisible(menuItem: ContextMenuItemDirective): boolean {
        return this.evaluateIfFunction(menuItem && menuItem.visible)
    }

    // tslint:disable-next-line: unknown-instead-of-any
    public evaluateIfFunction(value: any): any {
        if (value instanceof Function)
            return value(this.item)
        return value
    }

    public isDisabled(link: LinkConfig): boolean {
        return (link.enabled && !link.enabled(this.item)) as boolean
    }

    @HostListener('window:keydown.ArrowDown', ['$event'])
    @HostListener('window:keydown.ArrowUp', ['$event'])
    public onKeyEvent(event: KeyboardEvent): void {
        this._keyManager.onKeydown(event)
    }

    @HostListener('window:keydown.ArrowRight', ['$event'])
    public keyboardOpenSubMenu(event: KeyboardEvent): void {
        this._cancelEvent(event)
        const menuItem
        = this.menuItems[this._keyManager.activeItemIndex as number]
        if (menuItem)
            this.onOpenSubMenu(menuItem, event)
    }

    @HostListener('window:keydown.Enter', ['$event'])
    @HostListener('window:keydown.Space', ['$event'])
    public keyboardMenuItemSelect(event: KeyboardEvent): void {
        this._cancelEvent(event)
        const menuItem
        = this.menuItems[this._keyManager.activeItemIndex as number]
        if (menuItem)
            this.onMenuItemSelect(menuItem, event as MouseEvent | KeyboardEvent)
    }

    @HostListener('window:keydown.Escape', ['$event'])
    @HostListener('window:keydown.ArrowLeft', ['$event'])
    public onCloseLeafMenu(event: KeyboardEvent): void {
        this._cancelEvent(event)
        this.closeLeafMenu
            .emit({event, exceptRootMenu: event.keyCode === ARROW_LEFT_KEYCODE})
    }

    @HostListener('document:click', ['$event'])
    @HostListener('document:contextmenu', ['$event'])
    public closeMenu(event: MouseEvent): void {
        // tslint:disable-next-line:no-magic-numbers
        if (event.type === 'click' && event.button === 2)
            return
        this.closeAllMenus.emit({event})
    }

    public onOpenSubMenu(
        menuItem: ContextMenuItemDirective,
        event: MouseEvent | KeyboardEvent,
    ): void {
        if (menuItem.subMenu === undefined) {
            this.closeSubMenus.next({event})
            return
        }
        const anchorElementRef
        = this._menuItemElements
            .toArray()[this._keyManager.activeItemIndex as number]
        const anchorElement = anchorElementRef && anchorElementRef.nativeElement
        this.openSubMenu.emit({
            anchorElement,
            // @ts-ignore
            contextMenu: menuItem.subMenu,
            event,
            item: this.item,
            menuClass: menuItem.childMenuClass,
        })
    }

    public onMenuItemSelect(
        menuItem: ContextMenuItemDirective,
        event: MouseEvent | KeyboardEvent,
    ): void {
        event.preventDefault()
        event.stopPropagation()
        this.onOpenSubMenu(menuItem, event)
        if (!menuItem.subMenu)
            menuItem.triggerExecute(this.item, event)
    }

    @ViewChild('menu', {static: false}) private _menuElement!: ElementRef
    @ViewChildren('li') private _menuItemElements!: QueryList<ElementRef>
    private _keyManager!: ActiveDescendantKeyManager<ContextMenuItemDirective>
    private _subscription: Subscription = new Subscription()

    // tslint:disable-next-line: unknown-instead-of-any
    private _cancelEvent(event: any): void {
        if (!event)
            return

        const target: HTMLElement = event.target
        if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName) > -1 ||
            target.isContentEditable)
            return

        event.preventDefault()
        event.stopPropagation()
    }
}
