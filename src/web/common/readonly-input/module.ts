import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {LogiDialogModule} from '@logi/src/web/ui/dialog'

import {ReadonlyInputComponent} from './component'

@NgModule({
    declarations: [ReadonlyInputComponent],
    exports: [ReadonlyInputComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiDialogModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        ReactiveFormsModule,
    ],
})
export class ReadonlyInputModule {}
