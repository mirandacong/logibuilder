import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'logi-combobox-search',
    },
    selector: 'logi-combobox-search',
    styleUrls: ['./search.component.scss'],
    templateUrl: './search.component.html',
})
export class LogiComboboxSearchComponent {
    @Output() readonly searchChange$ = new EventEmitter<string>()
    @Output() readonly composingChange$ = new EventEmitter<boolean>()

    searchKey: string | null = null

    @ViewChild('input') inputElement?: ElementRef<HTMLInputElement>

    focus(): void {
        this.inputElement?.nativeElement.focus()
    }

    clearSearchKey(): void {
        if (this.inputElement)
            this.inputElement.nativeElement.value = ''
        this.onSearchChange('')
    }

    onSearchChange(value: string): void {
        if (value === this.searchKey)
            return
        this.searchKey = value
        this.searchChange$.next(value)
    }

    onCompositionChange(isComposing: boolean): void {
        this.composingChange$.next(isComposing)
    }
}
