import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {LogiCascadedSelectOptionComponent} from './option.component'
import {LogiCascadedSelectComponent} from './select.component'

@NgModule({
    declarations: [
        LogiCascadedSelectComponent,
        LogiCascadedSelectOptionComponent,
    ],
    exports: [
        LogiCascadedSelectComponent,
        LogiCascadedSelectOptionComponent,
    ],
    imports: [
        CommonModule,
        LogiInputModule,
        MatIconModule,
        MatRippleModule,
        OverlayModule,
        ReactiveFormsModule,
    ],
})
export class LogiCascadedSelectModule {}
