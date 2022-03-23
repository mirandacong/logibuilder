import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {FrequencyPickerComponent} from './component'

@NgModule({
    declarations: [FrequencyPickerComponent],
    exports: [FrequencyPickerComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatButtonModule,
        MatDatepickerModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
    ],
})
export class FrequencyPickerModule {}
