// tslint:disable: limit-indent-for-method-in-class
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
/* tslint:disable:component-selector */
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {EMPTY, merge, Observable, Subscription} from 'rxjs'
import {delay, map, mergeMap, startWith, switchMap} from 'rxjs/operators'

import {LogiThAddOnComponent} from '../cell/th_addon.component'

import {LogiTableDataService} from './../service/data.service'
import {LogiTableStyleService} from './../service/style.service'
import {LogiSafeAny} from './../table.type'
import {LogiTrDirective} from './tr.directive'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    selector: 'thead:not(.logi-table-thead)',
    templateUrl: './thead.template.html',
})
export class LogiTheadComponent implements AfterContentInit, OnDestroy,
AfterViewInit, OnInit {
    public constructor(
        private readonly _elementRef: ElementRef,
        private readonly _renderer: Renderer2,
        @Optional()
        private readonly _logiTableStyleService?: LogiTableStyleService,
        @Optional()
        private readonly _logiTableDataService?: LogiTableDataService,
    ) {
        // tslint:disable-next-line: no-double-negation
        this.isInsideTable = !!this._logiTableStyleService
    }
    @Input() public readonly logiSearchKey = ''
    public isInsideTable = false
    @ViewChild('content_template', {static: true})
    public templateRef!: TemplateRef<LogiSafeAny>
    @ContentChildren(LogiTrDirective, {descendants: true})
    public listOfLogiTrDirective!: QueryList<LogiTrDirective>
    @ContentChildren(LogiThAddOnComponent, {descendants: true})
    public listOfLogiThAddOnComponent!: QueryList<LogiThAddOnComponent>
    @Output() public readonly logiSortOrderChange = new EventEmitter<{ key: LogiSafeAny; value: string | null }>()

    public ngOnInit(): void {
        if (this._logiTableStyleService)
            this._logiTableStyleService.setTheadTemplate(this.templateRef)
    }

    // tslint:disable-next-line: max-func-body-length
    public ngAfterContentInit(): void {
        const firstTableRow$ = this.listOfLogiTrDirective.changes.pipe(
            startWith(this.listOfLogiTrDirective),
            map(item => item && item.first),
        ) as Observable<LogiTrDirective>
        firstTableRow$
            .pipe(switchMap(firstTableRow => (firstTableRow ? firstTableRow
                .listOfColumnsChanges() : EMPTY)))
            .subscribe(data => {
                this._logiTableStyleService?.setListOfTh(data)
                this._logiTableStyleService?.setListOfMeasureColumn(data)
            })
        const listOfFixedLeftColumnChanges$ = firstTableRow$.pipe(
            switchMap(firstTr => (firstTr ? firstTr
                .listOfFixedLeftColumnChanges() : EMPTY)),
        )
        const listOfFixedRightColumnChanges$ = firstTableRow$.pipe(
            switchMap(firstTr => (firstTr ? firstTr
                .listOfFixedRightColumnChanges() : EMPTY)),
        )
        this._subs.add(listOfFixedLeftColumnChanges$.subscribe(cols => {
            this._logiTableStyleService?.setHasFixLeft(cols.length !== 0)
        }))
        this._subs.add(listOfFixedRightColumnChanges$.subscribe(cols => {
            this._logiTableStyleService?.setHasFixRight(cols.length !== 0)
        }))
            // tslint:disable-next-line: no-type-assertion
        const listOfColumn$ = this.listOfLogiThAddOnComponent.changes
            .pipe(startWith(this.listOfLogiThAddOnComponent)) as Observable<
            QueryList<LogiThAddOnComponent>
        >
        this._subs.add(listOfColumn$
            .pipe(switchMap(() => merge(...this.listOfLogiThAddOnComponent
                .map(th => th.manualClickOrder$))))
            .subscribe((data: LogiThAddOnComponent) => {
                const emitValue = {key: data.logiColumnKey, value: data.sortOrder}
                this.logiSortOrderChange.emit(emitValue)
                if (!(data.logiSortFn && !data.logiSortPriority))
                    return
                this.listOfLogiThAddOnComponent
                    .filter(th => th !== data)
                    .forEach(th => th.clearSortOrder())
                this._logiTableDataService?.initSortCalc({
                    key: data.logiColumnKey,
                    sortFn: data.logiSortFn,
                    sortOrder: data.sortOrder,
                    sortPriority: data.logiSortPriority,
                })
            }))
        this._subs.add(listOfColumn$
            .pipe(
                switchMap(list => merge(...[listOfColumn$,
                    ...list.map(c => c.filterChanged$)])
                    .pipe(mergeMap(() => listOfColumn$))),
                map(list => list
                    .filter(item => !!item.logiFilterFn)
                    .map(item => {
                        return {
                            key: item.logiColumnKey,
                            filterFn: item.logiFilterFn!,
                            filterValue: item.logiFilterValue,
                        }})),
                    // TODO: after checked error here
                delay(0),
            )
            .subscribe(list => {
                if (list.length === 0)
                    return
                this._logiTableDataService?.initFilterCalc(list)
            }))
        this._subs.add(listOfColumn$
            .pipe(
                switchMap(list => merge(...[listOfColumn$,
                    ...list.map(c => c.customFilterValue$)])
                    .pipe(mergeMap(() => listOfColumn$))),
                map(list => list
                    .filter(item => !!item.logiFilterFn)
                    .map(item => {
                        return {
                            key: item.logiColumnKey,
                            filterFn: item.logiFilterFn!,
                            filterValue: item.logiFilterValue,
                        }})),
                    // TODO: after checked error here
                delay(0),
            )
            .subscribe(list => {
                if (list.length === 0)
                    return
                this._logiTableDataService?.initCustomSingleFilter(list)
            }))
    }

    public ngAfterViewInit(): void {
        if (this._logiTableStyleService)
            this._renderer.removeChild(
                this._renderer.parentNode(this._elementRef.nativeElement),
                this._elementRef.nativeElement,
            )
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }
    private _subs = new Subscription()
}
