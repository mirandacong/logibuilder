import {NgModule} from '@angular/core'
import {AddFbService} from '@logi/src/web/core/editor/add-fb'
import {NodeExpandService} from '@logi/src/web/core/editor/node-expand'

import {NodeFocusableDirective} from './directive'
import {NodeFocusService} from './service'

@NgModule({
    declarations: [NodeFocusableDirective],
    exports: [NodeFocusableDirective],
    providers: [
        AddFbService,
        NodeExpandService,
        NodeFocusService,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class NodeFocusableModule {}
export {NodeFocusableDirective}
