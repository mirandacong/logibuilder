import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatIconModule} from '@angular/material/icon'
import {MatInputModule} from '@angular/material/input'
import {MatMenuModule} from '@angular/material/menu'
import {MatTabsModule} from '@angular/material/tabs'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {ColumnModule} from '@logi/src/web/core/editor/logi-hierarchy/column'
import {
    ColumnBlockModule,
} from '@logi/src/web/core/editor/logi-hierarchy/column-block'
import {RowModule} from '@logi/src/web/core/editor/logi-hierarchy/row'
import {
    RowBlockModule,
} from '@logi/src/web/core/editor/logi-hierarchy/row-block'
import {
    SeparatorModule,
} from '@logi/src/web/core/editor/logi-hierarchy/separator'
import {
    StandardColumnModule,
} from '@logi/src/web/core/editor/logi-hierarchy/standard-header/standard-column'
import {
    StandardColumnBlockModule,
} from '@logi/src/web/core/editor/logi-hierarchy/standard-header/standard-column-block'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {DragImgModule} from '../drag-img/module'

import {TableComponent} from './component'

@NgModule({
    declarations: [TableComponent],
    exports: [TableComponent],
    imports: [
        ColumnBlockModule,
        ColumnModule,
        CommonModule,
        ContextMenuModule,
        DndModule,
        DragImgModule,
        FormsModule,
        LogiButtonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTabsModule,
        NodeFocusableModule,
        RowBlockModule,
        RowModule,
        SeparatorModule,
        StandardColumnBlockModule,
        StandardColumnModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class TableModule {
}
