import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatIconModule} from '@angular/material/icon'
import {RouterModule} from '@angular/router'

import {MenuItemComponent} from './component'

@NgModule({
    declarations: [MenuItemComponent],
    exports: [MenuItemComponent],
    imports: [
        CommonModule,
        MatIconModule,
        RouterModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class MenuItemModule {}
