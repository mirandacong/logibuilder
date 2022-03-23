import {DragDropModule} from '@angular/cdk/drag-drop'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatDialogModule} from '@angular/material/dialog'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {TableModule} from '@logi/src/web/core/editor/logi-hierarchy/table'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {DragImgModule} from '../drag-img/module'

import {TitleComponent} from './component'

@NgModule({
    declarations: [TitleComponent],
    exports: [TitleComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragDropModule,
        DragImgModule,
        FormsModule,
        LogiButtonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        NodeFocusableModule,
        TableModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class TitleModule {
}
