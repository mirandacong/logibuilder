import {NavGroup} from '../nav/group'
import {isNavItem, NavItem} from '../nav/item'

/**
 * Generate router urls from raw menu tree.
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
 * [
 * 'tools/test/examples/ex',
 * 'tools/test/examples/foo/bar',
 * 'tools/test/examples/foo/car',
 * ]
 * ```
 */
export function routerParse(input: NavGroup): readonly string[] {
    const urls: string[] = []
    input.group.forEach((nav: NavGroup | NavItem): void => {
        if (!isNavItem(nav)) {
            routerParse(nav).forEach((url: string): number => urls.push(url))
            return
        }
        urls.push(nav.url.replace(/\.md$/, ''))
    })
    return urls
}
