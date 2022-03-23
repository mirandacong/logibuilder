import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {LogiRadioButtonComponent} from './component'
import {LogiRadioGroupDirective} from './radio-group.directive'

@NgModule({
    declarations: [LogiRadioButtonComponent, LogiRadioGroupDirective],
    exports: [LogiRadioButtonComponent, LogiRadioGroupDirective],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatIconModule,
        MatRippleModule,
    ],
})
export class LogiRadioModule {}
