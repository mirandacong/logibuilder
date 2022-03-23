import {HttpClientModule} from '@angular/common/http'
import {NgModule} from '@angular/core'

import {DocsViewComponent} from './component'
import {PageNavModule} from './page-nav/module'

@NgModule({
    declarations: [DocsViewComponent],
    exports: [DocsViewComponent],
    imports: [
        PageNavModule,
        HttpClientModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class DocsViewModule {}
