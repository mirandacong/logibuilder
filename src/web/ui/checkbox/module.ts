import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {ReactiveFormsModule} from '@angular/forms'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {LogiCheckboxComponent} from './component'

@NgModule({
    declarations: [LogiCheckboxComponent],
    exports: [LogiCheckboxComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatRippleModule,
        ReactiveFormsModule,
    ],
})
export class LogiCheckboxModule {}
