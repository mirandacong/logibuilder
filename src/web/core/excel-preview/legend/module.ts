import {DragDropModule} from '@angular/cdk/drag-drop'
import {OverlayModule} from '@angular/cdk/overlay'
import {PortalModule} from '@angular/cdk/portal'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatRippleModule} from '@angular/material/core'
import {MatListModule} from '@angular/material/list'
import {MatTooltipModule} from '@angular/material/tooltip'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {LegendComponent} from './component'

@NgModule({
    declarations: [LegendComponent],
    exports: [LegendComponent],
    imports: [
        CommonModule,
        DragDropModule,
        LogiButtonModule,
        MatListModule,
        MatRippleModule,
        MatTooltipModule,
        OverlayModule,
        PortalModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class LegendModule {}
