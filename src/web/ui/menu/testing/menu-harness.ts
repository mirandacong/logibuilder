// tslint:disable: file-name-casing
import {coerceBooleanProperty} from '@angular/cdk/coercion'
import {
    ContentContainerComponentHarness,
    HarnessLoader,
    HarnessPredicate,
    TestElement,
    TestKey,
} from '@angular/cdk/testing'

import {
    MenuHarnessFilters,
    MenuItemHarnessFilters,
} from './menu-harness-filters'

// tslint:disable: ext-variable-name readonly-array no-null-keyword
// tslint:disable: no-unnecessary-method-declaration
export abstract class LogiMenuHarnessBase extends
ContentContainerComponentHarness<string> {
    public async isDisabled(): Promise<boolean> {
        const disabled = (await this.host()).getAttribute('disabled')
        return coerceBooleanProperty(await disabled)
    }

    public async isOpen(): Promise<boolean> {
        return !!(await this._getMenuPanel())
    }

    public async getTriggerText(): Promise<string> {
        return (await this.host()).text()
    }

    public async focus(): Promise<void> {
        return (await this.host()).focus()
    }

    public async blur(): Promise<void> {
        return (await this.host()).blur()
    }

    public async isFocused(): Promise<boolean> {
        return (await this.host()).isFocused()
    }

    public abstract open(): void

    // if (!await this.isOpen())
    //     return (await this.host()).click()

    public async close(): Promise<void> {
        const panel = await this._getMenuPanel()
        if (panel)
            return panel.sendKeys(TestKey.ESCAPE)
    }

    public async getItems(
        filters?: Omit<MenuItemHarnessFilters, 'ancestor'>,
    ): Promise<LogiMenuItemHarness[]> {
        const panelId = await this._getPanelId()
        if (panelId)
            return this._documentRootLocator.locatorForAll(
                this._itemClass.with({...(filters || {}),
                    ancestor: `#${panelId}`,
                } as MenuItemHarnessFilters),
            )()
        return []
    }

    public async clickItem(
        itemFilter: Omit<MenuItemHarnessFilters, 'ancestor'>,
        // tslint:disable-next-line: trailing-comma
        ...subItemFilters: Omit<MenuItemHarnessFilters, 'ancestor'>[]
    ): Promise<void> {
        await this.open()
        const items = await this.getItems(itemFilter)
        if (!items.length)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error(`Could not find item matching ${JSON
                .stringify(itemFilter)}`)

        if (!subItemFilters.length)
            return items[0].click()
        const menu = await items[0].getSubmenu()
        if (!menu)
            // tslint:disable-next-line: no-throw-unless-asserts
            throw Error(`Item matching ${JSON
                .stringify(itemFilter)} does not have a submenu`)
        return menu.clickItem(
            // tslint:disable-next-line: no-type-assertion
            ...subItemFilters as [Omit<MenuItemHarnessFilters, 'ancestor'>],
        )
    }

    protected _itemClass = LogiMenuItemHarness

    protected async getRootHarnessLoader(): Promise<HarnessLoader> {
        const panelId = await this._getPanelId()
        return this.documentRootLocatorFactory().harnessLoaderFor(`#${panelId}`)
    }
    private _documentRootLocator = this.documentRootLocatorFactory()

    private async _getMenuPanel(): Promise<TestElement | null> {
        const panelId = await this._getPanelId()
        return panelId ? this._documentRootLocator.locatorForOptional(
            `#${panelId}`,
        )() : null
    }

    private async _getPanelId(): Promise<string | null> {
        const panelId = await (await this.host()).getAttribute('aria-controls')
        return panelId || null
    }
}
export class LogiMenuHarness extends LogiMenuHarnessBase {
    public static hostSelector = '.logi-menu-trigger'

    public static with(
        options: MenuHarnessFilters = {},
    ): HarnessPredicate<LogiMenuHarness> {
        return new HarnessPredicate(LogiMenuHarness, options).addOption(
            'triggerText',
            options.triggerText,
            (harness, text) =>
                HarnessPredicate.stringMatches(harness.getTriggerText(), text),
        )
    }

    public async open(): Promise<void> {
        if (!await this.isOpen())
            return (await this.host()).click()
    }
}

export class LogiContextMenuHarness extends LogiMenuHarnessBase {
    public static hostSelector = '.logi-context-menu-trigger'

    public static with(
        options: MenuHarnessFilters = {},
    ): HarnessPredicate<LogiContextMenuHarness> {
        return new HarnessPredicate(LogiContextMenuHarness, options).addOption(
            'triggerText',
            options.triggerText,
            (harness, text) =>
                HarnessPredicate.stringMatches(harness.getTriggerText(), text),
        )
    }

    public async open(): Promise<void> {
        if (!await this.isOpen())
            // tslint:disable-next-line: no-non-null-assertion
            return (await this.host()).rightClick!(1, 1)
    }
}

export class LogiMenuItemHarness extends
ContentContainerComponentHarness<string> {
    public static hostSelector = '.logi-menu-item'
    public static with(
        options: MenuItemHarnessFilters = {},
    ): HarnessPredicate<LogiMenuItemHarness> {
        return new HarnessPredicate(LogiMenuItemHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate
                .stringMatches(harness.getText(), text))
            .addOption('hasSubmenu', options.hasSubmenu, async(
                harness,
                hasSubmenu,
            ) => (await harness.hasSubmenu()) === hasSubmenu)
    }

    public async isDisabled(): Promise<boolean> {
        const disabled = (await this.host()).getAttribute('disabled')
        return coerceBooleanProperty(await disabled)
    }

    public async getText(): Promise<string> {
        return (await this.host()).text()
    }

    public async focus(): Promise<void> {
        return (await this.host()).focus()
    }

    public async blur(): Promise<void> {
        return (await this.host()).blur()
    }

    public async isFocused(): Promise<boolean> {
        return (await this.host()).isFocused()
    }

    public async click(): Promise<void> {
        return (await this.host()).click()
    }

    public async hasSubmenu(): Promise<boolean> {
        return (await this.host()).matchesSelector(this._menuClass.hostSelector)
    }

    public async getSubmenu(): Promise<LogiMenuHarness | null> {
        if (await this.hasSubmenu())
            return new this._menuClass(this.locatorFactory)
        return null
    }
    protected _menuClass = LogiMenuHarness
}
