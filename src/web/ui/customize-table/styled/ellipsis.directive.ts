/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {BooleanInput} from '@angular/cdk/coercion'
import {Directive, Input} from '@angular/core'
import {InputBoolean} from '@logi/src/web/ui/common/utils'

@Directive({
    selector: 'th[logiEllipsis],td[logiEllipsis]',
    host: {
        '[class.logi-table-cell-ellipsis]': 'logiEllipsis',
    },
})
export class LogiCellEllipsisDirective {
    public static ngAcceptInputType_logiEllipsis: BooleanInput

    @Input() @InputBoolean() public logiEllipsis = true
}
