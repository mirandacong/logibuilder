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
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {SeparatorComponent} from './component'

@NgModule({
    declarations: [SeparatorComponent],
    exports: [SeparatorComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragDropModule,
        FormsModule,
        LogiButtonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        NodeFocusableModule,
    ],
})
export class SeparatorModule {}
