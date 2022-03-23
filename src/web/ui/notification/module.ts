import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatIconModule} from '@angular/material/icon'
import {MatSnackBarModule} from '@angular/material/snack-bar'

import {NotificationComponent} from './component'

@NgModule({
    declarations: [NotificationComponent],
    exports: [NotificationComponent],
    imports: [
        CommonModule,
        MatIconModule,
        MatSnackBarModule,
    ],
})
export class NotificationModule {}
