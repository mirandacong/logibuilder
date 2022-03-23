/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* tslint:disable:component-selector */
import {BooleanInput} from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core'
import {InputBoolean} from '@logi/src/web/ui/common/utils'

import {LogiSafeAny} from '../table.type'

@Component({
    selector: 'th[logiSelections],th[logiChecked],th[logiShowCheckbox],th[logiShowRowSelection]',
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './th_selection.template.html',
})
export class LogiThSelectionComponent implements OnChanges {
    public constructor(private elementRef: ElementRef) {
    // TODO: move to host after View Engine deprecation
        this.elementRef.nativeElement.classList
            .add('logi-table-selection-column')
    }
    public static ngAcceptInputType_logiShowCheckbox: BooleanInput
    public static ngAcceptInputType_logiShowRowSelection: BooleanInput

    @Input() public logiSelections: readonly {
        text: string;
        onSelect(...args: readonly LogiSafeAny[]): LogiSafeAny }[] = []
    @Input() public logiChecked = false
    @Input() public logiDisabled = false
    @Input() public logiIndeterminate = false
    @Input() @InputBoolean() public logiShowCheckbox = false
    @Input() @InputBoolean() public logiShowRowSelection = false
    @Output() public readonly logiCheckedChange = new EventEmitter<boolean>()

    public onCheckedChange(checked: boolean): void {
        this.logiChecked = checked
        this.logiCheckedChange.emit(checked)
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const isFirstChange = (
            value: SimpleChange,
        ) => value && value.firstChange && value.currentValue !== undefined
        const {logiChecked, logiSelections, logiShowExpand, logiShowCheckbox} = changes
        if (logiShowExpand)
            this.isLogiShowExpandChanged = true
        if (logiShowCheckbox)
            this.isLogiShowCheckboxChanged = true
        if (isFirstChange(logiSelections) && !this.isLogiShowExpandChanged)
            this.logiShowRowSelection = true
        if (isFirstChange(logiChecked) && !this.isLogiShowCheckboxChanged)
            this.logiShowCheckbox = true
    }

    private isLogiShowExpandChanged = false
    private isLogiShowCheckboxChanged = false
}
