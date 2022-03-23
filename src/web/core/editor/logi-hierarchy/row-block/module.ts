import {DragDropModule} from '@angular/cdk/drag-drop'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {
    SeparatorModule,
} from '@logi/src/web/core/editor/logi-hierarchy/separator'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {DragImgModule} from '../drag-img/module'
import {LabelModule} from '../label/module'
import {RowModule} from '../row/module'

import {RowBlockComponent} from './component'

@NgModule({
    declarations: [RowBlockComponent],
    exports: [RowBlockComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragDropModule,
        DragImgModule,
        FormsModule,
        LabelModule,
        LogiButtonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        NodeFocusableModule,
        RowModule,
        SeparatorModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class RowBlockModule {
}
