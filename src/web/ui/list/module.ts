import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatRippleModule} from '@angular/material/core'

import {LogiListComponent} from './list.component'
import {LogiListItemComponent} from './list_item.component'

@NgModule({
    declarations: [
        LogiListComponent,
        LogiListItemComponent,
    ],
    exports: [
        LogiListComponent,
        LogiListItemComponent,
    ],
    imports: [
        CommonModule,
        MatRippleModule,
    ],
})
export class LogiListModule {}
