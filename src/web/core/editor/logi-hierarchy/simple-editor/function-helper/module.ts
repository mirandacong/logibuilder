import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {FunctionHelperComponent} from './component'

export {FunctionHelperComponent} from './component'

@NgModule({
    declarations: [FunctionHelperComponent],
    // entryComponents: [FunctionHelperComponent],
    exports: [FunctionHelperComponent],
    imports: [CommonModule],
})
export class FunctionHelperModule {}
