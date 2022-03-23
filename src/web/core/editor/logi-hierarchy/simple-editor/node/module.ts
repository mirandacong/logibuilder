import {OverlayModule} from '@angular/cdk/overlay'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {NodeComponent} from './component'

@NgModule({
    declarations: [NodeComponent],
    exports: [NodeComponent],
    imports: [
        CommonModule,
        OverlayModule,
    ],
})
export class NodeModule {}
