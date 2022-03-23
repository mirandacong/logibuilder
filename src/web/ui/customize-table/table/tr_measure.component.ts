import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    Optional,
    QueryList,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core'
import {Subscription} from 'rxjs'
import {debounceTime} from 'rxjs/operators'

import {LogiTableStyleService} from '../service/style.service'

@Component({
    selector: 'tr[logi-table-measure-row]',
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './tr_measure.template.html',
})
export class LogiTrMeasureComponent implements AfterViewInit, OnDestroy {
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _ngZone: NgZone,
        private readonly _elementRef: ElementRef,
        @Optional() private readonly _tableStyleSvc?: LogiTableStyleService,
    ) {
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('logi-table-measure-now')
    }
    listOfMeasureColumn: readonly string[] = []
    @ViewChildren(
        'td_element',
    ) public listOfTdElement?: QueryList<ElementRef<HTMLTableRowElement>>
    public trackByFunc(_: number, key: string): string {
        return key
    }

    public ngAfterViewInit(): void {
        const debounce = 16
        this._subs.add(this.listOfTdElement?.changes
            .pipe(debounceTime(debounce))
            .subscribe((list: QueryList<ElementRef<HTMLTableRowElement>>) => {
                const data = list.toArray().map(i => i.nativeElement)
                this._ngZone.run(() => {
                    this._tableStyleSvc?.setListOfAutoWidth(data)
                })
            }))
        this._subs
            .add(this._tableStyleSvc?.listOfMeasureColumn().subscribe(e => {
                this.listOfMeasureColumn = e
                this._cd.detectChanges()
            }))
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }
    private _subs = new Subscription()
}
