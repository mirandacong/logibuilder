import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatTooltipModule} from '@angular/material/tooltip'
import {ModifierService} from './service'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiInputModule} from '@logi/src/web/ui/input'
import {LogiSelectModule} from '@logi/src/web/ui/select'

import {ExcelToolbarComponent} from './component'

@NgModule({
    declarations: [ExcelToolbarComponent],
    exports: [ExcelToolbarComponent],
    imports: [
        CommonModule,
        FormsModule,
        LogiButtonModule,
        LogiInputModule,
        LogiSelectModule,
        MatAutocompleteModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        MatTooltipModule,
        ReactiveFormsModule,
    ],
    providers: [
        ModifierService,
    ],
})
export class ExcelToolbarbarModule { }
