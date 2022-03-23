import {OverlayModule} from '@angular/cdk/overlay'
import {ScrollingModule} from '@angular/cdk/scrolling'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatRippleModule} from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon'
import {MatTooltipModule} from '@angular/material/tooltip'
import {EmptyModule} from '@logi/src/web/ui/empty'
import {SpinnerModule} from '@logi/src/web/ui/spinner'

import {LogiComboboxComponent} from './combobox.component'
import {LogiInnerOptionGroupComponent} from './inner-option-group.component'
import {LogiInnerOptionComponent} from './inner-option.component'
import {LogiComboboxOptionGroupComponent} from './option-group.component'
import {LogiComboboxOptionComponent} from './option.component'
import {PanelActionsDirective} from './panel-actions.directive'
import {LogiComboboxSearchComponent} from './search.component'
import {LogiSelectedLabelComponent} from './selected-label.component'
import {LogiComboboxTriggerComponent} from './trigger.component'

@NgModule({
    declarations: [
        LogiComboboxComponent,
        LogiComboboxOptionComponent,
        LogiComboboxOptionGroupComponent,
        LogiComboboxSearchComponent,
        LogiComboboxTriggerComponent,
        LogiInnerOptionComponent,
        LogiInnerOptionGroupComponent,
        LogiSelectedLabelComponent,
        PanelActionsDirective,
    ],
    exports: [
        LogiComboboxComponent,
        LogiComboboxOptionComponent,
        LogiComboboxOptionGroupComponent,
        PanelActionsDirective,
    ],
    imports: [
        CommonModule,
        EmptyModule,
        FormsModule,
        MatIconModule,
        MatRippleModule,
        MatTooltipModule,
        OverlayModule,
        ReactiveFormsModule,
        ScrollingModule,
        SpinnerModule,
    ],
})
export class LogiComboboxModule {}
