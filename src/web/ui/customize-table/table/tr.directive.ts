/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
    AfterContentInit,
    ContentChildren,
    Directive,
    OnDestroy,
    Optional,
    QueryList,
} from '@angular/core'
import {combineLatest, merge, Observable, ReplaySubject, Subject} from 'rxjs'
import {flatMap, map, startWith, switchMap, takeUntil} from 'rxjs/operators'

import {LogiCellFixedDirective} from '../cell/cell_fixed.directive'
import {LogiThMeasureDirective} from '../cell/th_measure.directive'

import {LogiTableStyleService} from './../service/style.service'

@Directive({
    selector: 'tr:not([mat-row]):not([mat-header-row]):not([logi-table-measure-row]):not([logiExpand]):not([logi-table-fixed-row])',
    host: {
        '[class.logi-table-row]': 'isInsideTable',
    },
})
export class LogiTrDirective implements AfterContentInit, OnDestroy {
    public constructor(
        @Optional() private readonly _logiTableStyleService: LogiTableStyleService,

        ) {
        this.isInsideTable = !!_logiTableStyleService
    }
    @ContentChildren(
        LogiThMeasureDirective,
    ) public listOfLogiThDirective!: QueryList<LogiThMeasureDirective>
    @ContentChildren(
        LogiCellFixedDirective,
    ) public listOfCellFixedDirective!: QueryList<LogiCellFixedDirective>
    public isInsideTable = false
    public listOfFixedLeftColumnChanges(
    ): Observable<readonly LogiCellFixedDirective[]> {
        return this
            .listOfFixedColumnsChanges()
            .pipe(map(list => list.filter(item => item.logiLeft !== false)))
    }

    public listOfFixedRightColumnChanges(
    ): Observable<readonly LogiCellFixedDirective[]> {
        return this
            .listOfFixedColumnsChanges()
            .pipe(map(list => list.filter(item => item.logiRight !== false)))
    }

    public listOfColumnsChanges(
    ): Observable<readonly LogiThMeasureDirective[]> {
        return this._listOfColumns$.pipe(
            switchMap(list =>
      merge(...[this._listOfColumns$, ...list.map((
          c: LogiThMeasureDirective,
      ) => c.changes$)]).pipe(flatMap(() => this._listOfColumns$)),
    ),
            takeUntil(this._destroy$),
        )
    }

    public listOfFixedColumnsChanges(
    ): Observable<readonly LogiCellFixedDirective[]> {
        return this._listOfFixedColumns$.pipe(
            switchMap(list =>
      merge(...[this._listOfFixedColumns$, ...list.map((
          c: LogiCellFixedDirective,
      ) => c.changes$)]).pipe(flatMap(() => this._listOfFixedColumns$)),
    ),
            takeUntil(this._destroy$),
        )
    }

    // tslint:disable-next-line: max-func-body-length
    public ngAfterContentInit(): void {
        if (this._logiTableStyleService) {
            this.listOfCellFixedDirective.changes
                .pipe(
                    startWith(this.listOfCellFixedDirective),
                    takeUntil(this._destroy$),
                )
                .subscribe(this._listOfFixedColumns$)
            this.listOfLogiThDirective.changes
                .pipe(
                    startWith(this.listOfLogiThDirective),
                    takeUntil(this._destroy$),
                )
                .subscribe(this._listOfColumns$)
      /** set last left and first right **/
            this.listOfFixedLeftColumnChanges().subscribe(listOfFixedLeft => {
                listOfFixedLeft.forEach(cell => cell.setIsLastLeft(
                    cell === listOfFixedLeft[listOfFixedLeft.length - 1],
                ),
            )
            })
            this.listOfFixedRightColumnChanges().subscribe(listOfFixedRight => {
                listOfFixedRight.forEach(
                    cell => cell.setIsFirstRight(cell === listOfFixedRight[0]),
                )
            })
      /** calculate fixed logiLeft and logiRight **/
            combineLatest([this._logiTableStyleService
                .listOfListOfThWidth(), this.listOfFixedLeftColumnChanges()],
            ).subscribe(([listOfAutoWidth, listOfLeftCell]) => {
                listOfLeftCell.forEach((cell, index) => {
                    if (cell.isAutoLeft) {
                        const currentArray = listOfLeftCell.slice(0, index)
                        const count = currentArray.reduce(
                            (
                                pre,
                                cur,
                            ) => pre + (cur.colspan || cur.colSpan || 1),
                            0,
                        )
                        const width = listOfAutoWidth.slice(0, count).reduce(
                            (pre, cur) => pre + cur,
                            0,
                        )
                        cell.setAutoLeftWidth(`${width}px`)
                    }
                })
            },
      )
            combineLatest([this._logiTableStyleService
                .listOfListOfThWidth(), this.listOfFixedRightColumnChanges()],
            ).subscribe(([listOfAutoWidth, listOfRightCell]) => {
                listOfRightCell.forEach((_, index) => {
                    const cell = listOfRightCell[listOfRightCell.length - index - 1]
                    if (cell.isAutoRight) {
                        const currentArray = listOfRightCell.slice(
                            listOfRightCell.length - index,
                            listOfRightCell.length,
                        )
                        const count = currentArray.reduce(
                            (
                                pre,
                                cur,
                            ) => pre + (cur.colspan || cur.colSpan || 1),
                            0,
                        )
                        const width = listOfAutoWidth
                            .slice(
                                listOfAutoWidth.length - count,
                                listOfAutoWidth.length,
                            )
                            .reduce((pre, cur) => pre + cur, 0)
                        cell.setAutoRightWidth(`${width}px`)
                    }
                })
            },
      )
        }
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()
    }
    private readonly _destroy$ = new Subject<void>()
    private readonly _listOfFixedColumns$ =
            new ReplaySubject<readonly LogiCellFixedDirective[]>(1)
    private readonly _listOfColumns$ =
            new ReplaySubject<readonly LogiThMeasureDirective[]>(1)
}
