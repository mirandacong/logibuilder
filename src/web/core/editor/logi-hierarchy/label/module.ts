import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'

import {LabelComponent} from './component'
import {LabelService} from './service'

@NgModule({
    declarations: [LabelComponent],
    exports: [LabelComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
    ],
    providers: [LabelService],
})
export class LabelModule {}
