import {OverlayModule} from '@angular/cdk/overlay'
import {PortalModule} from '@angular/cdk/portal'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatDatepickerModule} from '@angular/material/datepicker'
import {MatDialogModule} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {MatSelectModule} from '@angular/material/select'
import {MatTabsModule} from '@angular/material/tabs'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {ErrorInfoComponent} from './component'

@NgModule({
    declarations: [ErrorInfoComponent],
    exports: [ErrorInfoComponent],
    imports: [
        CommonModule,
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
        MatTabsModule,
        OverlayModule,
        PortalModule,
        ReactiveFormsModule,
    ],
})
export class ErrorInfoModule {}
