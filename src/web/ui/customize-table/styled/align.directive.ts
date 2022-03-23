/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {Directive, Input} from '@angular/core'

@Directive({
    selector: 'th[logiAlign],td[logiAlign]',
    host: {
        '[style.text-align]': 'logiAlign',
    },
})
export class LogiCellAlignDirective {
    @Input() public logiAlign: 'left' | 'right' | 'center' | null = null
}
