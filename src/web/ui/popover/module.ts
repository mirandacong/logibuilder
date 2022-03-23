import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {LogiPopoverComponent} from './popover.component'
import {LogiPopoverTriggerDirective} from './trigger.directive'

@NgModule({
    declarations: [
        LogiPopoverComponent,
        LogiPopoverTriggerDirective,
    ],
    exports: [
        LogiPopoverComponent,
        LogiPopoverTriggerDirective,
    ],
    imports: [CommonModule],
})
export class LogiPopoverModule {}
