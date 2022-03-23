import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {RouterModule} from '@angular/router'

import {MenuComponent} from './component'
import {MenuItemModule} from './menu-item/module'

@NgModule({
    declarations: [MenuComponent],
    exports: [MenuComponent],
    imports: [
        CommonModule,
        MenuItemModule,
        RouterModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class SideMenuModule {}
