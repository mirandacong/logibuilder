/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core'

import {LogiSafeAny, LogiTableSortOrder} from './../table.type'

@Component({
    selector: 'logi-table-sorters',
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './sorters.template.html',
})
export class LogiTableSortersComponent implements OnChanges {
    public constructor(private elementRef: ElementRef) {
    // TODO: move to host after View Engine deprecation
        this.elementRef.nativeElement.classList.add('logi-table-column-sorters')
    }
    @Input() public sortDirections: readonly LogiTableSortOrder[] = ['ascend', 'descend', null]
    @Input() public sortOrder: LogiTableSortOrder = null
    @Input() public contentTemplate: TemplateRef<LogiSafeAny> | null = null
    public isUp = false
    public isDown = false

    public ngOnChanges(changes: SimpleChanges): void {
        const {sortDirections} = changes
        if (sortDirections) {
            this.isUp = this.sortDirections.indexOf('ascend') !== -1
            this.isDown = this.sortDirections.indexOf('descend') !== -1
        }
    }
}
