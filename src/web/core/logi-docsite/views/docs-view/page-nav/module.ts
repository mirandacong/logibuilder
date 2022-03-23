import {NgModule} from '@angular/core'
import {MatButtonModule} from '@angular/material/button'
import {LogiButtonModule} from '@logi/src/web/ui/button'

import {PageNavComponent} from './component'

@NgModule({
    declarations: [PageNavComponent],
    exports: [PageNavComponent],
    imports: [
        LogiButtonModule,
        MatButtonModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class PageNavModule {}
