import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'

import {FbTagComponent} from './component'

@NgModule({
    declarations: [FbTagComponent],
    exports: [FbTagComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
    ],
})
export class FbTagModule {}
