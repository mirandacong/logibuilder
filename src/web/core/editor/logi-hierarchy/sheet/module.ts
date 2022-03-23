import { DragDropModule } from '@angular/cdk/drag-drop'
import { OverlayModule } from '@angular/cdk/overlay'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { ContextMenuModule } from '@logi/src/web/common/context-menu'
import { DndModule } from '@logi/src/web/core/editor/drag-drop'
import {
    LabelDialogModule,
} from '@logi/src/web/core/editor/node-edit/label-dialog'
import { NodeFocusableModule } from '@logi/src/web/core/editor/node-focus'
import { LogiButtonModule } from '@logi/src/web/ui/button'

import { DragImgModule } from '../drag-img/module'
import { TableModule } from '../table/module'
import { TitleModule } from '../title/module'

import { SheetComponent } from './component'

@NgModule({
    declarations: [SheetComponent],
    exports: [SheetComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragDropModule,
        DragImgModule,
        FormsModule,
        LabelDialogModule,
        LogiButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        NodeFocusableModule,
        OverlayModule,
        TableModule,
        TitleModule,
    ],
})
export class SheetModule { }
