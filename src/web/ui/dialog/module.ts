import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {A11yModule} from '@angular/cdk/a11y'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {InputDialogComponent} from './input.component'
import {DialogService} from './service'
import {TextDialogComponent} from './text.component'

@NgModule({
    declarations: [
        InputDialogComponent,
        TextDialogComponent,
    ],
    exports: [
        InputDialogComponent,
        TextDialogComponent,
    ],
    imports: [
        A11yModule,
        CommonModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatRippleModule,
        ReactiveFormsModule,
    ],
    providers: [DialogService],
})
export class LogiDialogModule {}
