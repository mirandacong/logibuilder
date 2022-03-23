import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {EditDialogComponent} from './component'

@NgModule({
    declarations: [EditDialogComponent],
    exports: [EditDialogComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiButtonModule,
        MatDialogModule,
        MatIconModule,
        MatRippleModule,
        ReactiveFormsModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class EditDialogModule {}
