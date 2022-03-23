import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatIconModule} from '@angular/material/icon'

import {PaletteComponent} from './component'

@NgModule({
    declarations: [PaletteComponent],
    exports: [PaletteComponent],
    imports: [
        CommonModule,
        MatIconModule,
    ],
})
export class PaletteModule {}
