import {NavGroup, NavGroupBuilder} from '../nav/group'
import {isNavItem, NavItem, NavItemBuilder} from '../nav/item'

/**
 * Generate menu tree from raw object.
 * Input:
 * ```ts
 * {
 * title: 'Examples',
 * group: [
 *     {title: 'Ex', url: 'tools/test/examples/ex.md'},
 *     {title: 'Foo', group: [
 *         {title: 'Bar', url: 'tools/test/examples/foo/bar.md'},
 *         {title: 'Cat', url: 'tools/test/examples/foo/cat.md'},
 *     ]}
 * ]
 * }
 * ```
 * Output:
 * ```ts
 * NavGroup {
 * title: 'Examples',
 * group: [
 *     NavItem {title: 'Ex', url: 'tools/test/examples/ex'},
 *     NavGroup {title: 'Foo', group: [
 *         NavItem {title: 'Bar', url: 'tools/test/examples/foo/bar'},
 *         NavItem {title: 'Cat', url: 'tools/test/examples/foo/cat'},
 *     ]}
 * ]
 * }
 * ```
 */
export function menuParse(input: NavGroup): NavGroup {
    const group: (NavGroup | NavItem)[] = []
    input.group.forEach((nav: NavItem | NavGroup): void => {
        if (!isNavItem(nav)) {
            group.push(menuParse(nav))
            return
        }
        group.push(new NavItemBuilder()
            .title(nav.title)
            .url(nav.url.replace(/\.md$/, ''))
            .build())
    })
    return new NavGroupBuilder().title(input.title).group(group).build()
}
