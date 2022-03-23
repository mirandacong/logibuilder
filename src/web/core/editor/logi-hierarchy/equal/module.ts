import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatRippleModule} from '@angular/material/core'

import {EqualComponent} from './component'

@NgModule({
    declarations: [EqualComponent],
    exports: [EqualComponent],
    imports: [
        CommonModule,
        MatRippleModule,
    ],
})
export class EqualModule {}
