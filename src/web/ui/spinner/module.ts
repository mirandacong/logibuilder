import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'

import {SpinnerComponent} from './component'

@NgModule({
    declarations: [SpinnerComponent],
    exports: [SpinnerComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
})
export class SpinnerModule {}
