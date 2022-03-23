import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {DndImageDirective} from './drag_image'
import {DraggableDirective, DragImgRefDirective} from './draggable.directive'
import {DropzoneDirective, PlaceholderRefDirective} from './dropzone.directive'
import {HandleDirective} from './handle.directive'

@NgModule({
    declarations: [
        DndImageDirective,
        DragImgRefDirective,
        DraggableDirective,
        DropzoneDirective,
        HandleDirective,
        PlaceholderRefDirective,
    ],
    exports: [
        DndImageDirective,
        DragImgRefDirective,
        DraggableDirective,
        DropzoneDirective,
        HandleDirective,
        PlaceholderRefDirective,
    ],
    imports: [
        CommonModule,
    ],
})
// tslint:disable:no-unnecessary-class
export class DndModule {}
