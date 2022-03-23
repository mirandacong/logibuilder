import {string, StringC, type, TypeC} from 'io-ts'

import {NavBase, NavBaseBuilder, NavBaseImpl} from './base'

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
export function isNavItem(node: NavBase): node is NavItem {
    return NavItemImpl.TYPE.is(node)
}

export interface NavItem extends NavBase {
    readonly url: string
}

class NavItemImpl extends NavBaseImpl implements NavItem {
    public static TYPE: TypeC<{ url: StringC; title: StringC; }> = type(
        {url: string, title: string},
    )
    public url = ''
}

export class NavItemBuilder
extends NavBaseBuilder<NavItem, NavItemImpl> {
    public constructor(obj?: Readonly<NavItem>) {
        const impl = new NavItemImpl()
        if (obj)
            NavItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public url(url: string): NavItemBuilder {
        this.getImpl().url = url
        return this
    }
}
