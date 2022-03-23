import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDividerModule} from '@angular/material/divider'
import {MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {EqualModule} from '@logi/src/web/core/editor/logi-hierarchy/equal'
import {
    SimpleEditorModule,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor'
import {SliceModule} from '@logi/src/web/core/editor/logi-hierarchy/slice'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {DragImgModule} from '../drag-img/module'
import {FbTagModule} from '../fb-tag/module'
import {LabelModule} from '../label/module'

import {ColumnComponent} from './component'
import {SlicePartComponent} from './slice/component'

@NgModule({
    declarations: [
        ColumnComponent,
        SlicePartComponent,
    ],
    exports: [ColumnComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragImgModule,
        EqualModule,
        FbTagModule,
        FormsModule,
        LabelModule,
        LogiButtonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        NodeFocusableModule,
        SimpleEditorModule,
        SliceModule,
    ],
})
export class ColumnModule {}
