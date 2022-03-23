import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatRippleModule, MAT_DATE_LOCALE} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {MatSelectModule} from '@angular/material/select'
import {PickerHeaderModule} from '@logi/src/web/common/header-picker/picker'
import {LogiSelectModule} from '@logi/src/web/ui/select'

import {DateRangeComponent} from './component'
import {PickerTitle} from './pipe'

@NgModule({
    declarations: [DateRangeComponent, PickerTitle],
    exports: [DateRangeComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiSelectModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatSelectModule,
        PickerHeaderModule,
        ReactiveFormsModule,
    ],
    /**
     * zh-Hans is the language code of Chinese(Simplified).
     */
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'zh-Hans'},
    ],
})
export class DateRangeModule {}
