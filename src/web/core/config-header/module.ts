import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule, MAT_DATE_LOCALE} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatDialogModule} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {MatSelectModule} from '@angular/material/select'
import {MatTooltipModule} from '@angular/material/tooltip'
import {DateRangeModule} from '@logi/src/web/common/header-picker/date-range'
import {ReadonlyInputModule} from '@logi/src/web/common/readonly-input'
import {
    StandardColumnModule,
} from '@logi/src/web/core/editor/logi-hierarchy/standard-header/standard-column'
import {
    StandardColumnBlockModule,
} from '@logi/src/web/core/editor/logi-hierarchy/standard-header/standard-column-block'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {ConfigHeaderComponent} from './component'

@NgModule({
    declarations: [ConfigHeaderComponent],
    exports: [ConfigHeaderComponent],
    imports: [
        CommonModule,
        DateRangeModule,
        FormsModule,
        LogiButtonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatSelectModule,
        MatTooltipModule,
        ReactiveFormsModule,
        ReadonlyInputModule,
        StandardColumnBlockModule,
        StandardColumnModule,
    ],
    /**
     * zh-Hans is the language code of Chinese(Simplified).
     */
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'zh-Hans'},
    ],
})
export class ConfigHeaderModule {}
