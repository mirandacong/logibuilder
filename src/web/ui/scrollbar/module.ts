import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {LogiScrollbarComponent} from './component'
import {
    LogiScrollbarHorizontalComponent,
} from './scrollbar_horizontal.component'
import {LogiScrollbarVerticalComponent} from './scrollbar_vertical.component'

@NgModule({
    declarations: [
        LogiScrollbarComponent,
        LogiScrollbarHorizontalComponent,
        LogiScrollbarVerticalComponent,
    ],
    exports: [LogiScrollbarComponent],
    imports: [CommonModule],
})
export class LogiScrollbarModule {}
