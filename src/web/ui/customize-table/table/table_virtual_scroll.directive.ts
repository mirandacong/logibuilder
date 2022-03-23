/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {Directive, TemplateRef} from '@angular/core'

import {LogiSafeAny} from '../table.type'

@Directive({
    exportAs: 'logiVirtualScroll',
    selector: '[logi-virtual-scroll]',
})
export class LogiTableVirtualScrollDirective {
    public constructor(
        public readonly templateRef: TemplateRef<{
            readonly $implicit: LogiSafeAny;
            readonly index: number }>,
    ) {}
}
