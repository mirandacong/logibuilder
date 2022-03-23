import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatDialogModule} from '@angular/material/dialog'
import {MatIconModule} from '@angular/material/icon'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {AboutComponent} from './component'

@NgModule({
    declarations: [AboutComponent],
    exports: [AboutComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class AboutModule {}
