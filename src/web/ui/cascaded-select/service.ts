import {Injectable, OnDestroy} from '@angular/core'
import {isArrayEqual} from '@logi/src/web/base/utils'
import {Observable, Subject} from 'rxjs'

import {CascadedSelectOption, isCascadedSelectOption, isGroupOption} from './option'

export interface OptionSelectedEvent {
    readonly option: CascadedSelectOption
    readonly index: number
}

// tslint:disable: max-func-body-length no-non-null-assertion
// tslint:disable: unknown-instead-of-any
// tslint:disable: readonly-array no-null-keyword
@Injectable()
export class CascadedSelectService implements OnDestroy {
    public ngOnDestroy(): void {
        this._redraw$.complete()
        this._optionSelected$.complete()
    }

    public setOptions(options: readonly CascadedSelectOption[]): void {
        // @ts-ignore
        this._columns = options && options.length ? [options] : []
        this.syngOptions()
    }

    public setValues(values: readonly any[]): void {
        this._values = values
    }

    public getColumns(): CascadedSelectOption[][] {
        return this._columns
    }

    public getActivatedOptions(): CascadedSelectOption[] {
        return this._activatedOptions
    }

    public getSelectedOptions(): CascadedSelectOption[] {
        return this._selectedOptions
    }

    public listenRedraw(): Observable<void> {
        return this._redraw$
    }

    public listOptionSelected(): Observable<OptionSelectedEvent | null> {
        return this._optionSelected$
    }

    public setOptionActivated(
        // tslint:disable-next-line: max-params
        option: CascadedSelectOption,
        columnIndex: number,
        performSelect = false,
        // @ts-ignore
        loadingChildren = true,
    ): void {
        if (option.disabled)
            return

        this._activatedOptions[columnIndex] = option
        this._trackAncestorActivatedOptions(columnIndex)
        this._dropBehindActivatedOptions(columnIndex)

        const isParent = isGroupOption(option)
        if (isParent)
            // @ts-ignore
            this._setColumnData(option.children!, columnIndex + 1, option)
        else if (option.isLeaf)
            this._dropBehindColumns(columnIndex)
        if (performSelect)
            this._setOptionSelected(option, columnIndex)
        this._redraw$.next()
    }

    public syngOptions(): void {
        this._activatedOptions = []
        this._selectedOptions = []
        this._initColumnWithIndex(0)
    }

    private _columns: CascadedSelectOption[][] = []
    private _values: readonly any[] = []
    private _selectedOptions: CascadedSelectOption[] = []
    private _activatedOptions: CascadedSelectOption[] = []
    private _redraw$ = new Subject<void>()
    private readonly _optionSelected$ =
        new Subject<OptionSelectedEvent | null>()

    private _initColumnWithIndex(columnIndex: number): void {
        const activatedOptionSetter = () => {
            const currentValue = this._values[columnIndex]
            // tslint:disable-next-line: no-typeof-undefined
            if (typeof currentValue === 'undefined' || currentValue === null) {
                this._redraw$.next()
                return
            }
            const option = this._findOptionWithValue(
                columnIndex,
                this._values[columnIndex],
            )
            if (!option) {
                this._redraw$.next()
                return
            }
            this.setOptionActivated(option, columnIndex, false, false)

            if (columnIndex < this._values.length - 1) {
                this._initColumnWithIndex(columnIndex + 1)
                return
            }
            this._dropBehindColumns(columnIndex)
            this._selectedOptions = [...this._activatedOptions]
            this._redraw$.next()
        }

        if (this._columns[columnIndex] && this._columns[columnIndex].length > 0)
            activatedOptionSetter()
    }

    private _findOptionWithValue(
        columnIndex: number,
        value: CascadedSelectOption | any,
    ): CascadedSelectOption | null {
        const targetColumn = this._columns[columnIndex]
        if (targetColumn) {
            const v = isCascadedSelectOption(value) ? value.value : value
            return targetColumn.find(o => v === o.value)!
        }
        return null
    }

    private _trackAncestorActivatedOptions(startIndex: number): void {
        for (let i = startIndex - 1; i >= 0; i -= 1)
            if (!this._activatedOptions[i])
                this._activatedOptions[i] =
                    this._activatedOptions[i + 1].parent!
    }

    private _dropBehindActivatedOptions(lastReserveIndex: number): void {
        this._activatedOptions = this._activatedOptions
            .splice(0, lastReserveIndex + 1)
    }

    private _dropBehindColumns(lastReserveIndex: number): void {
        if (lastReserveIndex < this._columns.length - 1)
            this._columns = this._columns.slice(0, lastReserveIndex + 1)
    }

    private _setColumnData(
        options: CascadedSelectOption[],
        columnIndex: number,
        parent: CascadedSelectOption,
    ): void {
        const existingOptions = this._columns[columnIndex]
        if (!isArrayEqual(existingOptions, options)) {
            // @ts-ignore
            options.forEach(o => (o.parent = parent))
            this._columns[columnIndex] = options
            this._dropBehindColumns(columnIndex)
        }
    }

    private _setOptionSelected(
        option: CascadedSelectOption,
        index: number,
    ): void {
        if (option.isLeaf) {
            this._selectedOptions = [...this._activatedOptions]
            this._prepareEmitValue()
            this._redraw$.next()
            this._optionSelected$.next({option, index})
        }
    }

    private _prepareEmitValue(): void {
        this._values = this._selectedOptions.map(o => o.value)
    }
}
