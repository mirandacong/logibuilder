import {ComponentHarness} from '@angular/cdk/testing'

import {ContextMenuItemHarness} from './context-menu-item-harness'

// tslint:disable: ext-variable-name readonly-array
export class ContextMenuHarness extends ComponentHarness {
    public static hostSelector = '.logi-context-menu-trigger'

    public async trigger(): Promise<void> {
        const host = await this.host()
        if (!host.dispatchEvent)
            return
        return host.dispatchEvent('contextmenu')
    }

    public async getItems(): Promise<ContextMenuItemHarness[]> {
        return this._documentRootLocator.locatorForAll(ContextMenuItemHarness)()
    }

    private _documentRootLocator = this.documentRootLocatorFactory()
}
