/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core'
import {LogiCheckboxChange} from '@logi/src/web/ui/checkbox'

import {LogiSafeAny} from './../table.type'

@Component({
    selector: 'logi-table-selection',
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './selection.template.html',
})
export class LogiTableSelectionComponent {
    public constructor(private elementRef: ElementRef) {
    // TODO: move to host after View Engine deprecation
        this.elementRef.nativeElement.classList.add('logi-table-selection')
    }
    @Input() public listOfSelections: readonly {
        text: string;
        onSelect(...args: readonly LogiSafeAny[]): LogiSafeAny;
    }[] = []
    @Input() public checked = false
    @Input() public disabled = false
    @Input() public indeterminate = false
    @Input() public showCheckbox = false
    @Input() public showRowSelection = false
    @Output() public readonly checkedChange = new EventEmitter<boolean>()

    public onCheckedChange(checked: LogiCheckboxChange): void {
        this.checked = checked.checked
        this.checkedChange.emit(this.checked)
    }
}
