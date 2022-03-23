/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import {Directive, Optional} from '@angular/core'

import {LogiTableStyleService} from './../service/style.service'

@Directive({
    selector: 'th:not(.logi-disable-th):not([mat-cell]), td:not(.logi-disable-td):not([mat-cell])',
    host: {
        '[class.logi-table-cell]': 'isInsideTable',
    },
})
export class LogiTableCellDirective {
    public constructor(@Optional() logiTableStyleService: LogiTableStyleService) {
        this.isInsideTable = !!logiTableStyleService
    }
    public isInsideTable = false
}
