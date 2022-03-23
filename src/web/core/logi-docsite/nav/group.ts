import {NavBase, NavBaseBuilder, NavBaseImpl} from './base'
import {NavItem} from './item'

export function isNavGroup(node: NavBase): node is NavGroup {
    return node instanceof NavGroupImpl
}

export interface NavGroup extends NavBase {
    /**
     * Markdown document and markdown document group may display in the same
     * level, so they need to be ordered by the order of Array.
     */
    readonly group: readonly Readonly<(NavItem | NavGroup)>[]
}

class NavGroupImpl extends NavBaseImpl implements NavGroup {
    public group: readonly Readonly<(NavItem | NavGroup)>[] = []
}

export class NavGroupBuilder
extends NavBaseBuilder<NavGroup, NavGroupImpl> {
    public constructor(obj?: Readonly<NavGroup>) {
        const impl = new NavGroupImpl()
        if (obj)
            NavGroupBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public group(
        group: readonly Readonly<(NavItem | NavGroup)>[],
    ): NavGroupBuilder {
        this.getImpl().group = group
        return this
    }
}
