import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatTooltipModule} from '@angular/material/tooltip'
import {
    NodeModule,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor/node'

import {SuggestionComponent} from './component'

@NgModule({
    declarations: [SuggestionComponent],
    imports: [
        CommonModule,
        MatTooltipModule,
        NodeModule,
        OverlayModule,
    ],
})
export class SuggestionPanelModule {}
