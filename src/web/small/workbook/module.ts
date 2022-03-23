import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {ContextMenuModule} from '@logi/src/web/common/context-menu'
import {EmptyModule} from '@logi/src/web/ui/empty'
import {ReadonlyInputModule} from '@logi/src/web/common/readonly-input'
import {
    CustomSheetModule,
} from '@logi/src/web/core/editor/logi-hierarchy/custom-sheet'
import {SheetModule} from '@logi/src/web/core/editor/logi-hierarchy/sheet'
import {ErrorInfoModule} from '@logi/src/web/core/error-info'
import {ExcelPreviewModule} from '@logi/src/web/core/excel-preview'
import {ExcelToolbarbarModule} from '@logi/src/web/small/excel-toolbar'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {SpinnerModule} from '@logi/src/web/ui/spinner'
import {LogiTabsModule} from '@logi/src/web/ui/tabs'

import {WorkbookComponent} from './component'
import {TopMenuModule} from './fx-menu'

@NgModule({
    declarations: [WorkbookComponent],
    exports: [WorkbookComponent],
    imports: [
        CommonModule,
        ContextMenuModule,
        CustomSheetModule,
        EmptyModule,
        ErrorInfoModule,
        ExcelPreviewModule,
        ExcelToolbarbarModule,
        LogiButtonModule,
        LogiTabsModule,
        MatIconModule,
        MatMenuModule,
        ReadonlyInputModule,
        SheetModule,
        SpinnerModule,
        TopMenuModule,
    ],
})
export class WorkbookModule { }
