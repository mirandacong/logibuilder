import {NgModule} from '@angular/core'

import {LogiButtonToggleComponent} from './button.component'
import {LogiButtonToggleGroupDirective} from './group.directive'

@NgModule({
    declarations: [
        LogiButtonToggleComponent,
        LogiButtonToggleGroupDirective,
    ],
    exports: [
        LogiButtonToggleComponent,
        LogiButtonToggleGroupDirective,
    ],
    imports: [],
})
export class LogiButtonToggleModule {}
