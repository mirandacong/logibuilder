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
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {DragImgModule} from '../../drag-img/module'
import {FbTagModule} from '../../fb-tag/module'
import {LabelModule} from '../../label/module'

import {StandardColumnComponent} from './component'
import {SlicePartComponent} from './slice/component'

@NgModule({
    declarations: [
        SlicePartComponent,
        StandardColumnComponent,
    ],
    exports: [
        SlicePartComponent,
        StandardColumnComponent,
    ],
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
    ],
})
export class StandardColumnModule {}
