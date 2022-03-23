import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatRippleModule} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {
    FrequencyPickerModule,
} from '@logi/src/web/common/header-picker/frequency-picker'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {PickerHeaderComponent} from './component'

@NgModule({
    declarations: [PickerHeaderComponent],
    exports: [PickerHeaderComponent],
    imports: [
        CommonModule,
        FrequencyPickerModule,
        LogiButtonModule,
        MatDatepickerModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
    ],
})
export class PickerHeaderModule {}
