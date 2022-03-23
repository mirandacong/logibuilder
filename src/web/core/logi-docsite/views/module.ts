import {NgModule} from '@angular/core'
import {MatSidenavModule} from '@angular/material/sidenav'
import {MatToolbarModule} from '@angular/material/toolbar'

import {DocSiteComponent} from './component'
import {DocsViewModule} from './docs-view/module'
import {SideMenuModule} from './side-menu/module'
import {TocModule} from './toc-view/module'

@NgModule({
    declarations: [DocSiteComponent],
    exports: [DocSiteComponent],
    imports: [
        DocsViewModule,
        MatSidenavModule,
        MatToolbarModule,
        SideMenuModule,
        TocModule,
    ],
})
// tslint:disable-next-line: no-unnecessary-class
export class DocSiteModule {}
export {DocSiteComponent}
