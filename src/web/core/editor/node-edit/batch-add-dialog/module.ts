import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiCheckboxModule} from '@logi/src/web/ui/checkbox'

import {BatchAddDialogComponent} from './component'

@NgModule({
    declarations: [BatchAddDialogComponent],
    exports: [BatchAddDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiButtonModule,
        LogiCheckboxModule,
        MatButtonModule,
        MatDialogModule,
        MatRippleModule,
    ],
})
// tslint:disable-next-line:no-unnecessary-class
export class BatchAddDialogModule {}
