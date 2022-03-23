/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core'

import {LogiSafeAny} from '../table.type'

@Component({
    selector: 'logi-table-title-footer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './title_footer.template.html',
    host: {
        '[class.logi-table-title]': 'title !== null',
        '[class.logi-table-footer]': 'footer !== null',
    },
})
export class LogiTableTitleFooterComponent {
    @Input() public title: string | TemplateRef<LogiSafeAny> | null = null
    @Input() public footer: string | TemplateRef<LogiSafeAny> | null = null
}
