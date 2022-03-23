import {DragDropModule} from '@angular/cdk/drag-drop'
import {CdkTreeModule} from '@angular/cdk/tree'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon'
import {MatTableModule} from '@angular/material/table'
import {MatTreeModule} from '@angular/material/tree'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {FuncDocComponent} from './component'

@NgModule({
    declarations: [FuncDocComponent],
    exports: [FuncDocComponent],
    imports: [
        CdkTreeModule,
        CommonModule,
        DragDropModule,
        LogiButtonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTreeModule,
    ],
})
export class FuncDocModule {}
