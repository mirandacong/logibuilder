import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {TocComponent} from './component'

@NgModule({
    declarations: [TocComponent],
    exports: [TocComponent],
    imports: [CommonModule],
})
// tslint:disable-next-line: no-unnecessary-class
export class TocModule {}
