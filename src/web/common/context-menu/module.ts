import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {ModuleWithProviders, NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {MatTooltipModule} from '@angular/material/tooltip'
import {PaletteModule} from '@logi/src/web/common/palette'

import {ContextMenuAttachDirective} from './attach.directive'
import {ContextMenuClickAttachDirective} from './click_trigger.directive'
import {ContextMenuComponent} from './component'
import {ContextMenuContentComponent} from './content.component'
import {ContextMenuItemDirective} from './item.directive'
import {ContextMenuOptions} from './options'
import {ContextMenuService} from './service'
import {CONTEXT_MENU_OPTIONS} from './tokens'

@NgModule({
    declarations: [
        ContextMenuAttachDirective,
        ContextMenuClickAttachDirective,
        ContextMenuComponent,
        ContextMenuContentComponent,
        ContextMenuItemDirective,
    ],
    entryComponents: [
        ContextMenuContentComponent,
    ],
    exports: [
        ContextMenuAttachDirective,
        ContextMenuClickAttachDirective,
        ContextMenuComponent,
        ContextMenuItemDirective,
    ],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        OverlayModule,
        PaletteModule,
    ],
})
export class ContextMenuModule {
    public static forRoot(
        // tslint:disable-next-line: no-optional-parameter
        options?: ContextMenuOptions,
    ): ModuleWithProviders<ContextMenuModule> {
        return {
            ngModule: ContextMenuModule,
            providers: [
                ContextMenuService,
                {
                    provide: CONTEXT_MENU_OPTIONS,
                    useValue: options,
                },
            ],
        }
    }
}
