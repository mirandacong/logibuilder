/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// tslint:disable: no-unexternalized-strings
// tslint:disable: relative-url-prefix no-host-metadata-property
// tslint:disable: use-component-view-encapsulation component-selector
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core'

import {LogiSafeAny, LogiTableLayout} from '../table.type'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[style.table-layout]': 'tableLayout',
    },
    selector: 'table[logi-table-content]',
    templateUrl: 'table_content.template.html',
})
export class LogiTableContentComponent {
    @Input() public tableLayout: LogiTableLayout = 'auto'
    @Input() public theadTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public contentTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public listOfColWidth: readonly (string | null)[] = []
}
