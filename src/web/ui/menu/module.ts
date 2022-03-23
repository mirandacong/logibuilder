import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {MatTooltipModule} from '@angular/material/tooltip'

import {LogiMenuTriggerDirective} from './click_trigger.directive'
import {LogiMenuComponent} from './component'
import {LogiMenuContentDirective} from './content.directive'
import {LogiContextmenuTriggerDirective} from './contextmenu_trigger.directive'
import {LogiMenuItemDirective} from './item.directive'

@NgModule({
    declarations: [
        LogiContextmenuTriggerDirective,
        LogiMenuComponent,
        LogiMenuContentDirective,
        LogiMenuItemDirective,
        LogiMenuTriggerDirective,
    ],
    exports: [
        LogiContextmenuTriggerDirective,
        LogiMenuComponent,
        LogiMenuContentDirective,
        LogiMenuItemDirective,
        LogiMenuTriggerDirective,
    ],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        OverlayModule,
    ],
})
export class LogiMenuModule {}
