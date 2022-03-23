import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'

import {DragImgComponent} from './component'

@NgModule({
    declarations: [DragImgComponent],
    exports: [DragImgComponent],
    imports: [
        CommonModule,
        DndModule,
        MatButtonModule,
        MatIconModule,
    ],
})
// tslint:disable-next-line:no-unnecessary-class
export class DragImgModule {}
