/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {BooleanInput} from '@angular/cdk/coercion'
import {Directive, Input} from '@angular/core'

@Directive({
    selector: 'th[logiBreakWord],td[logiBreakWord]',
    host: {
        '[style.word-break]': "logiBreakWord ? 'break-all' : ''",
    },
})
export class LogiCellBreakWordDirective {
    public static ngAcceptInputType_logiBreakWord: BooleanInput

    @Input() public logiBreakWord = true
}
