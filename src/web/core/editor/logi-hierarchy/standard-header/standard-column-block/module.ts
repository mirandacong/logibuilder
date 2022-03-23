import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatAutocompleteModule} from '@angular/material/autocomplete'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {NodeFocusableModule} from '@logi/src/web/core/editor/node-focus/module'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {StandardColumnModule} from '../standard-column/module'

import {StandardColumnBlockComponent} from './component'

@NgModule({
    declarations: [StandardColumnBlockComponent],
    exports: [StandardColumnBlockComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        DndModule,
        FormsModule,
        LogiButtonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        NodeFocusableModule,
        StandardColumnModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class StandardColumnBlockModule {}
