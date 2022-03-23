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
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core'
import {Subject} from 'rxjs'

import {LogiSafeAny, LogiTableFilterList} from './../table.type'

interface LogiThItemInterface {
     // tslint:disable-next-line: readonly-keyword
    text: string
     // tslint:disable-next-line: readonly-keyword
    value: LogiSafeAny
     // tslint:disable-next-line: readonly-keyword
    checked: boolean
}

@Component({
    selector: 'logi-table-filter',
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './filter.template.html',
})
export class LogiTableFilterComponent implements OnChanges, OnDestroy {
    public constructor(private readonly _elementRef: ElementRef) {
    // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('logi-table-filter-column')
    }
    @Input() public contentTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public customFilter = false
    @Input() public extraTemplate: TemplateRef<LogiSafeAny> | null = null
    @Input() public filterMultiple = true
    @Input() public listOfFilter: LogiTableFilterList = []
    @Output() public readonly filterChange = new EventEmitter<readonly LogiSafeAny[] | LogiSafeAny>()
    public isChanged = false
    public isChecked = false
    public listOfParsedFilter: readonly LogiThItemInterface[] = []

    public trackByValue(_: number, item: LogiThItemInterface): LogiSafeAny {
        return item.value
    }

    public check(filter: LogiThItemInterface): void {
        this.isChanged = true
        if (this.filterMultiple) {
            this.listOfParsedFilter = this.listOfParsedFilter.map(item => {
                if (item === filter)
                    return {...item, checked: !filter.checked}

                return item
            })
            filter.checked = !filter.checked
        } else
      this.listOfParsedFilter = this.listOfParsedFilter.map(item => {
          return {...item, checked: item === filter}
      })
        this.isChecked = this._getCheckedStatus(this.listOfParsedFilter)
    }

    public confirm(): void {
        this._emitFilterData()
    }

    public reset(): void {
        this.isChanged = true
        this.listOfParsedFilter = this
            ._parseListOfFilter(this.listOfFilter, true)
        this.isChecked = this._getCheckedStatus(this.listOfParsedFilter)
        this._emitFilterData()
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const {listOfFilter} = changes
        if (listOfFilter && this.listOfFilter && this.listOfFilter.length) {
            this.listOfParsedFilter = this._parseListOfFilter(this.listOfFilter)
            this.isChecked = this._getCheckedStatus(this.listOfParsedFilter)
        }
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()
    }
    private _destroy$ = new Subject()

    private _getCheckedStatus(
        listOfParsedFilter: readonly LogiThItemInterface[],
    ): boolean {
        return listOfParsedFilter.some(item => item.checked)
    }

    private _parseListOfFilter(
        listOfFilter: LogiTableFilterList,
        reset?: boolean,
    ): readonly LogiThItemInterface[] {
        return listOfFilter.map(item => {
            const checked = reset ? false : !!item.byDefault
            return {text: item.text, value: item.value, checked}
        })
    }

    private _emitFilterData(): void {
        if (!this.isChanged)
            return
        const listOfChecked = this.listOfParsedFilter
            .filter(item => item.checked)
            .map(item => item.value)
        if (this.filterMultiple)
            this.filterChange.emit(listOfChecked)
        else
            this.filterChange
                .emit(listOfChecked.length > 0 ? listOfChecked[0] : null)
        this.isChanged = false
    }
}
