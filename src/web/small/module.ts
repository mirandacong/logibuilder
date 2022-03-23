import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'

import {SmallComponent} from './component'

import {
    ContextMenuActionService,
} from '@logi/src/web/core/editor/contextmenu-action'
import {
    BaseApiService,
    DownloadService,
    StudioApiService,
    SaveAsService,
} from '@logi/src/web/global/api'
import {TableTabStatusService} from '@logi/src/web/core/editor/table-tab-status'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {DialogService} from '@logi/src/web/ui/dialog'
import {CleanDataService} from '@logi/src/web/core/editor/clean-data'
import {ContextMenuService} from '@logi/src/web/common/context-menu'
import {MatIconModule} from '@angular/material/icon'
import {DndService} from '@logi/src/web/core/editor/drag-drop'
import {WorkbookModule} from '@logi/src/web/small/workbook'
import {ExcelService} from '@logi/src/web/core/excel-preview'
import {ShortcutService} from './shortcut.service'

@NgModule({
    declarations: [SmallComponent],
    exports: [SmallComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        ReactiveFormsModule,
        WorkbookModule,
    ],
    providers: [
        CleanDataService,
        ContextMenuActionService,
        ContextMenuService,
        DialogService,
        DndService,
        DownloadService,
        ExcelService,
        NodeEditService,
        SaveAsService,
        ShortcutService,
        StudioApiService,
        TableTabStatusService,
        /**
         * TODO(zengkai): Get a better way.
         * Now only for notice service.
         */
        {provide: BaseApiService, useExisting: StudioApiService},
    ],
})
export class SmallModule { }
