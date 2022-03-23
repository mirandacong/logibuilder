import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {MatDialogModule} from '@angular/material/dialog'
import {MatDividerModule} from '@angular/material/divider'
import {MatIconModule} from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {MatTooltipModule} from '@angular/material/tooltip'
import {RouterModule} from '@angular/router'
import {AboutModule} from '@logi/src/web/common/about'
import {CleanDataService} from '@logi/src/web/core/editor/clean-data'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {TopMenuComponent} from './component'
import {TopMenuConfigComponent} from './config/component'
import {TopMenuEditComponent} from './edit/component'
import {TopMenuFileComponent} from './file/component'
import {TopMenuFunctionComponent} from './function/component'
import {TopMenuHelpComponent} from './help/component'
import {FxMenuService} from './services/service'
import {SumDialogModule} from './services/sum-dialog'
import {TopMenuToolbarComponent} from './toolbar/component'
import {TopMenuService} from './service'

@NgModule({
    declarations: [
        TopMenuComponent,
        TopMenuConfigComponent,
        TopMenuEditComponent,
        TopMenuFileComponent,
        TopMenuFunctionComponent,
        TopMenuHelpComponent,
        TopMenuToolbarComponent,
    ],
    exports: [TopMenuComponent],
    imports: [
        AboutModule,
        CommonModule,
        FormsModule,
        LogiButtonModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        MatSnackBarModule,
        MatTooltipModule,
        ReactiveFormsModule,
        RouterModule.forChild([]),
        SumDialogModule,
    ],
    providers: [CleanDataService, FxMenuService, TopMenuService],
})
export class TopMenuModule { }
