/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import {BidiModule} from '@angular/cdk/bidi'
import {DragDropModule} from '@angular/cdk/drag-drop'
import {PlatformModule} from '@angular/cdk/platform'
import {ScrollingModule} from '@angular/cdk/scrolling'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatPaginatorModule} from '@angular/material/paginator'
import {LogiButtonModule} from '@logi/src/web/ui/button'
import {LogiCheckboxModule} from '@logi/src/web/ui/checkbox'
import {LogiOutletModule} from '@logi/src/web/ui/common/outlet'
import {EmptyModule} from '@logi/src/web/ui/empty'
import {LogiRadioModule} from '@logi/src/web/ui/radio'
import {LogiScrollbarModule} from '@logi/src/web/ui/scrollbar'
import {SpinnerModule} from '@logi/src/web/ui/spinner'

import {LogiTableFilterComponent} from './addon/filter.component'
import {LogiRowIndentDirective} from './addon/row_indent.directive'
import {LogiTableSelectionComponent} from './addon/selection.component'
import {LogiTableSortersComponent} from './addon/sorters.component'
import {LogiTableCellDirective} from './cell/cell.directive'
import {LogiCellFixedDirective} from './cell/cell_fixed.directive'
import {LogiTdAddOnComponent} from './cell/td_addon.component'
import {LogiThAddOnComponent} from './cell/th_addon.component'
import {LogiThMeasureDirective} from './cell/th_measure.directive'
import {LogiThSelectionComponent} from './cell/th_selection.component'
import {LogiCellAlignDirective} from './styled/align.directive'
import {LogiCellEllipsisDirective} from './styled/ellipsis.directive'
import {LogiCellBreakWordDirective} from './styled/word_break.directive'
import {LogiTableComponent} from './table/table.component'
import {LogiTableContentComponent} from './table/table_content.component'
import {LogiTableFixedRowComponent} from './table/table_fixed_row.component'
import {
    LogiTableInnerScrollComponent,
} from './table/table_inner_scroll.component'
import {
    LogiTableVirtualScrollDirective,
} from './table/table_virtual_scroll.directive'
import {LogiTbodyComponent} from './table/tbody.component'
import {LogiTheadComponent} from './table/thead.component'
import {LogiTableTitleFooterComponent} from './table/title_footer.component'
import {LogiTrDirective} from './table/tr.directive'
import {LogiTrExpandDirective} from './table/tr_expand.directive'
import {LogiTrMeasureComponent} from './table/tr_measure.component'

@NgModule({
    declarations: [
        LogiCellAlignDirective,
        LogiCellBreakWordDirective,
        LogiCellEllipsisDirective,
        LogiCellFixedDirective,
        LogiRowIndentDirective,
        LogiTableCellDirective,
        LogiTableComponent,
        LogiTableContentComponent,
        LogiTableFilterComponent,
        LogiTableFixedRowComponent,
        LogiTableInnerScrollComponent,
        LogiTableSelectionComponent,
        LogiTableSortersComponent,
        LogiTableTitleFooterComponent,
        LogiTableVirtualScrollDirective,
        LogiTbodyComponent,
        LogiTdAddOnComponent,
        LogiThAddOnComponent,
        LogiThMeasureDirective,
        LogiThSelectionComponent,
        LogiTheadComponent,
        LogiTrDirective,
        LogiTrExpandDirective,
        LogiTrMeasureComponent,
    ],
    exports: [
        LogiCellAlignDirective,
        LogiCellBreakWordDirective,
        LogiCellEllipsisDirective,
        LogiCellFixedDirective,
        LogiTableCellDirective,
        LogiTableComponent,
        LogiTableFixedRowComponent,
        LogiTableVirtualScrollDirective,
        LogiTbodyComponent,
        LogiTdAddOnComponent,
        LogiThAddOnComponent,
        LogiThMeasureDirective,
        LogiThSelectionComponent,
        LogiTheadComponent,
        LogiTrDirective,
        LogiTrExpandDirective,
    ],
    imports: [
        BidiModule,
        CommonModule,
        DragDropModule,
        EmptyModule,
        FormsModule,
        LogiButtonModule,
        LogiCheckboxModule,
        LogiOutletModule,
        LogiRadioModule,
        LogiScrollbarModule,
        MatIconModule,
        MatMenuModule,
        MatPaginatorModule,
        PlatformModule,
        ScrollingModule,
        SpinnerModule,
    ],
})
export class LogiTableModule {}
