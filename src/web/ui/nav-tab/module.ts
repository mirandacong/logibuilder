import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {MatRippleModule} from '@angular/material/core'
import {RouterModule} from '@angular/router'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {NavTabComponent} from './component'

@NgModule({
    declarations: [NavTabComponent],
    exports: [NavTabComponent],
    imports: [
        CommonModule,
        LogiButtonModule,
        MatButtonModule,
        MatRippleModule,
        RouterModule,
    ],
})
export class NavTabModule {}
