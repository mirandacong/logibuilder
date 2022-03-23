import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {EmptyComponent} from './component'
import {DefaultImgComponent} from './default_img.component'

@NgModule({
    declarations: [
        DefaultImgComponent,
        EmptyComponent,
    ],
    exports: [EmptyComponent],
    imports: [CommonModule],
})
export class EmptyModule {}
