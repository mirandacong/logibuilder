import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core'
import {MatIconModule} from '@angular/material/icon'
import {NoopAnimationsModule} from '@angular/platform-browser/animations'
import {AddFbService} from '@logi/src/web/core/editor/add-fb'
import {
    ContextMenuActionService,
} from '@logi/src/web/core/editor/contextmenu-action'
import {DndModule} from '@logi/src/web/core/editor/drag-drop'
import {
    LabelDialogModule,
} from '@logi/src/web/core/editor/node-edit/label-dialog'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {TableTabStatusService} from '@logi/src/web/core/editor/table-tab-status'
import {StudioApiService} from '@logi/src/web/global/api'
import {LogiDialogModule} from '@logi/src/web/ui/dialog'

import {NodeEditService} from '../node-edit/service'

@NgModule({
    imports: [
        DndModule,
        LabelDialogModule,
        LogiDialogModule,
        MatIconModule,
    ],
    providers: [
        AddFbService,
        ContextMenuActionService,
        NodeEditService,
        NodeFocusService,
        NoopAnimationsModule,
        StudioApiService,
        TableTabStatusService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditorTestModule { }
