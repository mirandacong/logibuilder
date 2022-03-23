import {ComponentPortal} from '@angular/cdk/portal'
import {Builder} from '@logi/base/ts/common/builder'
// tslint:disable: no-unused no-empty
// tslint:disable: unknown-instead-of-any
export type BooleanItemType = boolean | ((ite: any) => boolean)
export interface ContextMenuItem {
    readonly divider: boolean
    readonly enabled: BooleanItemType
    readonly visible: BooleanItemType
    readonly subMenu?: readonly ContextMenuItem[]
    readonly shortcut?: string
    readonly showToolTip?: boolean
    readonly childMenuClass?: string
    readonly isCurr?: boolean
    // tslint:disable-next-line: unknown-instead-of-any
    readonly portal?: ComponentPortal<any>
    html(item?: unknown): string
    click?(item?: unknown): void
}

class ContextMenuItemImpl implements ContextMenuItem {
    public divider!: boolean
    public enabled!: BooleanItemType
    public visible!: BooleanItemType
    public subMenu?: readonly ContextMenuItem[] = []
    public childMenuClass = ''
    public shortcut?: string
    public isCurr?: boolean
    public showToolTip?: boolean
    public portal?: ComponentPortal<any>
    // @ts-ignore
    public click: (item?: unknown) => void = (item?: unknown) => {}
    // @ts-ignore
    public html: (item?: unknown) => string = (item?: unknown) => ''
}

export class ContextMenuItemBuilder
extends Builder<ContextMenuItem, ContextMenuItemImpl> {
    public constructor(obj?: Readonly<ContextMenuItem>) {
        const impl = new ContextMenuItemImpl()
        if (obj)
            ContextMenuItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public divider(divider: boolean): this {
        this.getImpl().divider = divider
        return this
    }

    public enabled(enabled: BooleanItemType): this {
        this.getImpl().enabled = enabled
        return this
    }

    public visible(visible: BooleanItemType): this {
        this.getImpl().visible = visible
        return this
    }

    public html(html: () => string): this {
        this.getImpl().html = html
        return this
    }

    public click(click: () => void): this {
        this.getImpl().click = click
        return this
    }

    public subMenu(subMenu: readonly ContextMenuItem[]): this {
        this.getImpl().subMenu = subMenu
        return this
    }

    public shortcut(shortcut: string): this {
        this.getImpl().shortcut = shortcut
        return this
    }

    public isCurr(isCurr: boolean): this {
        this.getImpl().isCurr = isCurr
        return this
    }

    public portal(portal: ComponentPortal<any>): this {
        this.getImpl().portal = portal
        return this
    }

    public showToolTip(showToolTip: boolean): this {
        this.getImpl().showToolTip = showToolTip
        return this
    }

    protected get daa(): readonly string[] {
        return ContextMenuItemBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'divider',
        'enabled',
        'visible',
    ]
}

export function isContextMenuItem(value: unknown): value is ContextMenuItem {
    return value instanceof ContextMenuItemImpl
}

export function assertIsContextMenuItem(
    value: unknown,
): asserts value is ContextMenuItem {
    if (!(value instanceof ContextMenuItemImpl))
        throw Error('Not a ContextMenuItem!')
}
