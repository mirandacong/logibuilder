import {NgModule, Provider} from '@angular/core'
import {StudioApiService} from '@logi/src/web/global/api'

import {AddFbService} from './add-fb'
import {CleanDataService} from './clean-data'
import {ContextMenuActionService} from './contextmenu-action'
import {DndModule, DndService} from './drag-drop'
import {LabelDialogModule} from './node-edit/label-dialog'
import {NodeEditService} from './node-edit/service'
import {NodeFocusService} from './node-focus'
import {TableTabStatusService} from './table-tab-status'

// tslint:disable-next-line: readonly-array
export const PROVIDERS: Provider[] = [
    AddFbService,
    ContextMenuActionService,
    NodeEditService,
    NodeFocusService,
    DndService,
    TableTabStatusService,
    CleanDataService,
    StudioApiService,
]

@NgModule({
    imports: [
        DndModule,
        LabelDialogModule,
    ],
    providers: PROVIDERS,
})
export class EditorModule { }
