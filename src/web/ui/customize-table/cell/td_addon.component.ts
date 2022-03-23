/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* tslint:disable:component-selector */

import {BooleanInput} from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core'
import {LogiCheckboxChange} from '@logi/src/web/ui/checkbox'
import {InputBoolean} from '@logi/src/web/ui/common/utils'

@Component({
    selector: 'td[logiChecked], td[logiDisabled], td[logiIndeterminate], td[logiIndentSize], td[logiExpand], td[logiShowExpand], td[logiShowCheckbox]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './td_addon.template.html',
    host: {
        '[class.logi-table-cell-with-append]': 'logiShowExpand || logiIndentSize > 0',
        '[class.logi-table-selection-column]': 'logiShowCheckbox',
    },
})
export class LogiTdAddOnComponent implements OnChanges {
    public static ngAcceptInputType_logiShowExpand: BooleanInput
    public static ngAcceptInputType_logiShowCheckbox: BooleanInput
    public static ngAcceptInputType_logiExpand: BooleanInput

    @Input() public logiChecked = false
    @Input() public logiDisabled = false
    @Input() public logiIndeterminate = false
    @Input() public logiIndentSize = 0
    @Input() @InputBoolean() public logiShowExpand = false
    @Input() @InputBoolean() public logiShowCheckbox = false
    @Input() @InputBoolean() public logiExpand = false
    @Output() public readonly logiCheckedChange = new EventEmitter<boolean>()
    @Output() public readonly logiExpandChange = new EventEmitter<boolean>()

    public onCheckedChange(checked: LogiCheckboxChange): void {
        this.logiChecked = checked.checked
        this.logiCheckedChange.emit(this.logiChecked)
    }

    public onExpandChange(expand: boolean): void {
        if (!this.logiShowExpand)
            return
        this.logiExpand = expand
        this.logiExpandChange.emit(expand)
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const isFirstChange = (
            value: SimpleChange,
        ) => value && value.firstChange && value.currentValue !== undefined
        const {logiExpand, logiChecked, logiShowExpand, logiShowCheckbox} = changes
        if (logiShowExpand)
            this.isLogiShowExpandChanged = true
        if (logiShowCheckbox)
            this.isLogiShowCheckboxChanged = true
        if (isFirstChange(logiExpand) && !this.isLogiShowExpandChanged)
            this.logiShowExpand = true
        if (isFirstChange(logiChecked) && !this.isLogiShowCheckboxChanged)
            this.logiShowCheckbox = true
    }
    private isLogiShowExpandChanged = false
    private isLogiShowCheckboxChanged = false
}
