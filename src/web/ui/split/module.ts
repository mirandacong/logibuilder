import {CommonModule} from '@angular/common'
import {ModuleWithProviders, NgModule} from '@angular/core'

import {SplitComponent} from './component'
import {SplitAreaDirective} from './directive'

@NgModule({
    declarations: [
        SplitAreaDirective,
        SplitComponent,
    ],
    exports: [
        SplitAreaDirective,
        SplitComponent,
    ],
    imports: [CommonModule],
})
// tslint:disable-next-line: no-unnecessary-class
export class AngularSplitModule {
    public static forRoot(): ModuleWithProviders<AngularSplitModule> {
        return {
            ngModule: AngularSplitModule,
            providers: [],
        }
    }

    public static forChild(): ModuleWithProviders<AngularSplitModule> {
        return {
            ngModule: AngularSplitModule,
            providers: [],
        }
    }
}
