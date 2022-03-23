/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {Directive, Optional, Self} from '@angular/core'
import {RouterLink, RouterLinkWithHref} from '@angular/router'

/**
 * This component is for catching `routerLink` directive.
 */
@Directive({
    exportAs: 'logiTabLink',
    selector: 'a[logi-tab-link]',
})
export class LogiTabLinkDirective {
    public constructor(
        @Optional() @Self() public readonly routerLink?: RouterLink,
        @Optional() @Self()
        public readonly routerLinkWithHref?: RouterLinkWithHref,
    ) {}
}
