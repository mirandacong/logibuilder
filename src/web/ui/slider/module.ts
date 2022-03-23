import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {LogiSliderHandleComponent} from './handle.component'
import {LogiSliderComponent} from './slider.component'
import {LogiSliderTooltipDirective} from './tooltip.directive'
import {LogiSliderTrackComponent} from './track.component'

@NgModule({
    declarations: [
        LogiSliderComponent,
        LogiSliderHandleComponent,
        LogiSliderTooltipDirective,
        LogiSliderTrackComponent,
    ],
    exports: [LogiSliderComponent],
    imports: [
        CommonModule,
        OverlayModule,
    ],
})
export class LogiSliderModule {}
