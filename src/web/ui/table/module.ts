import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatIconModule} from '@angular/material/icon'
import {MatPaginatorModule} from '@angular/material/paginator'
import {MatRadioModule} from '@angular/material/radio'
import {MatSortModule} from '@angular/material/sort'
import {MatTableModule} from '@angular/material/table'
import {SpinnerModule} from '@logi/src/web/ui/spinner'

import {ColumnDefDirective} from './column_def.directive'
import {LogiTableComponent} from './component'

@NgModule({
    declarations: [
        ColumnDefDirective,
        LogiTableComponent,
    ],
    exports: [
        ColumnDefDirective,
        LogiTableComponent,
    ],
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatIconModule,
        MatPaginatorModule,
        MatRadioModule,
        MatSortModule,
        MatTableModule,
        SpinnerModule,
    ],
})
export class LogiTableModule {}
