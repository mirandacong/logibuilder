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

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    exportAs: 'logiTabBody',
    preserveWhitespaces: false,
    // tslint:disable-next-line: component-selector
    selector: '[logi-tab-body]',
    styleUrls: ['./tab-body.style.scss'],
    templateUrl: './tab-body.template.html',
})
export class LogiTabBodyComponent {
    // tslint:disable-next-line: unknown-instead-of-any no-null-keyword
    @Input() public content: TemplateRef<any> | null = null
    @Input() public active = false
    @Input() public forceRender = false
}
