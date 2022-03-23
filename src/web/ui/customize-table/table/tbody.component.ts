/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* tslint:disable:component-selector */

import {
    ChangeDetectionStrategy,
    Component,
    Optional,
    ViewEncapsulation,
} from '@angular/core'

import {LogiTableStyleService} from './../service/style.service'

@Component({
    selector: 'tbody',
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './tbody.template.html',
    host: {
        '[class.logi-table-tbody]': 'isInsideTable',
    },
})
export class LogiTbodyComponent {
    // tslint:disable-next-line: max-func-body-length
    public constructor(
        @Optional() private readonly logiTableStyleSvc: LogiTableStyleService,

    ) {
        this.isInsideTable = !!this.logiTableStyleSvc
    }
    public isInsideTable = false
}
