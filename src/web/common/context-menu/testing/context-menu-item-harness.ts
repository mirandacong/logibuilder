import {ComponentHarness} from '@angular/cdk/testing'

// tslint:disable: ext-variable-name no-unnecessary-method-declaration
export class ContextMenuItemHarness extends ComponentHarness {
    public static hostSelector = '.logi-context-menu-item-handle'

    public async click(): Promise<void> {
        return (await this.host()).click()
    }

    public async getText(): Promise<string> {
        return (await this.host()).text()
    }
}
