/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import {DragDropModule} from '@angular/cdk/drag-drop'
import {ObserversModule} from '@angular/cdk/observers'
import {PlatformModule} from '@angular/cdk/platform'
import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {MatIconModule} from '@angular/material/icon'
import {LogiOutletModule} from '@logi/src/web/ui/common/outlet'
import {AngularSplitModule} from '@logi/src/web/ui/split'

import {LogiTabBodyComponent} from './tab-body.component'
import {LogiTabLabelDirective} from './tab-label.directive'
import {LogiTabLinkDirective} from './tab-link.directive'
import {LogiTabComponent} from './tab.component'
import {LogiTabDirective} from './tab.directive'
import {LogiTabsInkBarDirective} from './tabs-ink-bar.directive'
import {LogiTabsNavComponent} from './tabs-nav.component'
import {LogiTabSetComponent} from './tabset.component'

@NgModule({
    declarations: [
        LogiTabBodyComponent,
        LogiTabComponent,
        LogiTabDirective,
        LogiTabLabelDirective,
        LogiTabLinkDirective,
        LogiTabSetComponent,
        LogiTabsInkBarDirective,
        LogiTabsNavComponent,
    ],
    exports: [
        LogiTabComponent,
        LogiTabDirective,
        LogiTabLabelDirective,
        LogiTabLinkDirective,
        LogiTabSetComponent,
        LogiTabsInkBarDirective,
        LogiTabsNavComponent,
    ],
    imports: [
        AngularSplitModule,
        CommonModule,
        DragDropModule,
        LogiOutletModule,
        MatIconModule,
        ObserversModule,
        PlatformModule,
    ],
})
export class LogiTabsModule {}
