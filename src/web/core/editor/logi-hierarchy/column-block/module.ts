import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {
    SeparatorModule,
} from '@logi/src/web/core/editor/logi-hierarchy/separator'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {ColumnModule} from '../column/module'
import {DragImgModule} from '../drag-img/module'
import {LabelModule} from '../label/module'

import {ColumnBlockComponent} from './component'

@NgModule({
    declarations: [ColumnBlockComponent],
    exports: [ColumnBlockComponent],
    imports: [
        ColumnModule,
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragImgModule,
        FormsModule,
        LabelModule,
        LogiButtonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        NodeFocusableModule,
        SeparatorModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class ColumnBlockModule {}
