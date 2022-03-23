import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatDividerModule} from '@angular/material/divider'
import {
    NodeModule,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor/node'

import {UnitPanelComponent} from './component'

@NgModule({
    declarations: [UnitPanelComponent],
    imports: [
        CommonModule,
        MatDividerModule,
        NodeModule,
        OverlayModule,
    ],
})
export class UnitPanelModule {}
