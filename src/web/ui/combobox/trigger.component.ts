import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'

import {OptionPayload, SelectedOptionPayload, SelectMode} from './interface'
import {LogiComboboxSearchComponent} from './search.component'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.logi-combobox-trigger-empty]': 'isEmptySelect',
        class: 'logi-combobox-trigger',
    },
    selector: 'logi-combobox-trigger',
    styleUrls: ['./trigger.component.scss'],
    templateUrl: './trigger.component.html',
})
export class LogiComboboxTriggerComponent implements OnChanges {
    constructor(private readonly _el: ElementRef<HTMLElement>) {}
    @Input() selectedOptions: readonly OptionPayload[] = []
    @Input() mode: SelectMode = 'default'
    @Input() disabled = false
    @Input() panelOpen = false
    @Input() placeholder = '请选择'
    @Input() innerLabel = ''
    @Input() showSearch = false
    @Input() ripple = false
    @Input() maxShowTagCount = Infinity
    @Output() readonly searchChange$ = new EventEmitter<string>()
    @Output() readonly deleleSelected$ =
        new EventEmitter<SelectedOptionPayload>()

    isShowPlaceholder = true
    isShowSingleSelect = false
    searchKey: string | null = null
    isComposing = false
    slicedOptions: readonly SelectedOptionPayload[] = []

    @ViewChild(LogiComboboxSearchComponent)
    searchComponent?: LogiComboboxSearchComponent

    get isEmptySelect(): boolean {
        return this.selectedOptions.length === 0
    }

    ngOnChanges(changes: SimpleChanges): void {
        const {
            selectedOptions, maxShowTagCount, panelOpen,
        }: SimpleChanges = changes
        if (selectedOptions)
            this.update()
        if (selectedOptions || maxShowTagCount) {
            const items: SelectedOptionPayload[] =
                this.selectedOptions.slice(0, this.maxShowTagCount)
            if (this.selectedOptions.length > this.maxShowTagCount)
                items.push({
                    isExceedTag: true,
                    label: `+ ${this.selectedOptions.length - this.maxShowTagCount}`,
                    value: null,
                })
            this.slicedOptions = items
        }
        if (panelOpen && panelOpen.currentValue && !panelOpen.previousValue)
            this.focus()
    }

    getHostElement(): HTMLElement {
        return this._el.nativeElement
    }

    focus(): void {
        this.searchComponent?.focus()
    }

    clearSearchKey(): void {
        this.searchComponent?.clearSearchKey()
    }

    update(): void {
        const isSelectedValueEmpty = this.selectedOptions.length === 0
        this.isShowPlaceholder = isSelectedValueEmpty &&
            !this.isComposing && !this.searchKey
        this.isShowSingleSelect = !isSelectedValueEmpty &&
            !this.isComposing && !this.searchKey
    }

    onDeleteSelected(option: SelectedOptionPayload): void {
        if (this.disabled || option.disabled)
            return
        this.deleleSelected$.next(option)
    }

    onSearchChange(value: string): void {
        if (value === this.searchKey)
            return
        this.searchKey = value
        this.update()
        this.searchChange$.next(value)
    }

    onCompositionChange(isComposing: boolean): void {
        this.isComposing = isComposing
        this.update()
    }
}
