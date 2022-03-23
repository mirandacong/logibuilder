import {Builder} from '@logi/base/ts/common/builder'

import {ContextMenuComponent} from './component'
import {ContextMenuItemDirective} from './item.directive'
import {ContextMenuOverlay} from './overlay'
// tslint:disable: unknown-instead-of-any
export interface ContextMenuClickEvent {
    readonly anchorElement?: Element | EventTarget
    readonly contextMenu?: ContextMenuComponent
    readonly event?: MouseEvent | KeyboardEvent
    readonly item: any
    readonly activeMenuItemIndex?: number
    readonly menuItems?: readonly ContextMenuItemDirective[]
    readonly menuClass?: string
    readonly parent?: ContextMenuOverlay
}

class ContextMenuClickEventImpl implements ContextMenuClickEvent {
    public anchorElement?: Element | EventTarget
    public contextMenu?: ContextMenuComponent
    public event?: MouseEvent | KeyboardEvent
    public item!: any
    public activeMenuItemIndex?: number
    public menuItems?: readonly ContextMenuItemDirective[] = []
    public menuClass?: string
    public parent?: ContextMenuOverlay
}

export class ContextMenuClickEventBuilder extends
Builder<ContextMenuClickEvent, ContextMenuClickEventImpl> {
    public constructor(obj?: Readonly<ContextMenuClickEvent>) {
        const impl = new ContextMenuClickEventImpl()
        if (obj)
            ContextMenuClickEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public anchorElement(anchorElement: Element | EventTarget): this {
        this.getImpl().anchorElement = anchorElement
        return this
    }

    public contextMenu(contextMenu: ContextMenuComponent): this {
        this.getImpl().contextMenu = contextMenu
        return this
    }

    public event(event: MouseEvent | KeyboardEvent): this {
        this.getImpl().event = event
        return this
    }

    public item(item: any): this {
        this.getImpl().item = item
        return this
    }

    public activeMenuItemIndex(activeMenuItemIndex: number): this {
        this.getImpl().activeMenuItemIndex = activeMenuItemIndex
        return this
    }

    public menuItems(menuItems: readonly ContextMenuItemDirective[]): this {
        this.getImpl().menuItems = menuItems
        return this
    }

    public menuClass(menuClass?: string): this {
        this.getImpl().menuClass = menuClass
        return this
    }

    public parent(parent: ContextMenuOverlay): this {
        this.getImpl().parent = parent
        return this
    }

    protected get daa(): readonly string[] {
        return ContextMenuClickEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'item',
    ]
}

export function isContextMenuClickEvent(
    value: unknown,
): value is ContextMenuClickEvent {
    return value instanceof ContextMenuClickEventImpl
}

export function assertIsContextMenuClickEvent(
    value: unknown,
): asserts value is ContextMenuClickEvent {
    if (!(value instanceof ContextMenuClickEventImpl))
        throw Error('Not a ContextMenuClickEvent!')
}
