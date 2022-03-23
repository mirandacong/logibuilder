import {OverlayModule} from '@angular/cdk/overlay'
import {ScrollingModule} from '@angular/cdk/scrolling'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {MatTooltipModule} from '@angular/material/tooltip'
import {LogiInputModule} from '@logi/src/web/ui/input'

import {LogiOptionComponent} from './option.component'
import {LogiOptionGroupComponent} from './option_group.component'
import {LogiSelectPanelActionsDirective} from './panel_actions.directive'
import {LogiSelectComponent} from './select.component'
import {LogiSelectedLabelComponent} from './selected_label.component'

@NgModule({
    declarations: [
        LogiOptionComponent,
        LogiOptionGroupComponent,
        LogiSelectComponent,
        LogiSelectPanelActionsDirective,
        LogiSelectedLabelComponent,
    ],
    exports: [
        LogiOptionComponent,
        LogiOptionGroupComponent,
        LogiSelectComponent,
        LogiSelectPanelActionsDirective,
    ],
    imports: [
        CommonModule,
        LogiInputModule,
        MatIconModule,
        MatRippleModule,
        MatTooltipModule,
        OverlayModule,
        ReactiveFormsModule,
        ScrollingModule,
    ],
})
export class LogiSelectModule {}
