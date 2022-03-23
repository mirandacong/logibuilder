import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiCheckboxModule} from '@logi/src/web/ui/checkbox'

import {LogiTransferComponent} from './transfer.component'
import {LogiTransferListComponent} from './transfer_list.component'

@NgModule({
    declarations: [LogiTransferComponent, LogiTransferListComponent],
    exports: [LogiTransferComponent, LogiTransferListComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        LogiCheckboxModule,
        MatIconModule,
        MatRippleModule,
    ],
})
export class LogiTransferModule {}
