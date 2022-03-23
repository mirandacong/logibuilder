import {NgModule} from '@angular/core'

import {TooltipComponent} from './component'

export {TooltipComponent} from './component'
@NgModule({
    declarations: [TooltipComponent],
    entryComponents: [TooltipComponent],
    exports: [TooltipComponent],
})
// tslint:disable-next-line: no-unnecessary-class
export class TooltipModule {}
