import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {LogiSwitchComponent} from './component'

@NgModule({
    declarations: [LogiSwitchComponent],
    exports: [LogiSwitchComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatRippleModule,
        ReactiveFormsModule,
    ],
})
export class LogiSwitchModule {}
