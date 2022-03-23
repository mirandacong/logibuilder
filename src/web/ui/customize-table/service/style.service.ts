/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {Injectable, TemplateRef} from '@angular/core'
import {
    BehaviorSubject,
    combineLatest,
    Observable,
    ReplaySubject,
    Subject,
} from 'rxjs'
import {map} from 'rxjs/operators'

import {LogiThMeasureDirective} from '../cell/th_measure.directive'

import {LogiSafeAny} from './../table.type'

@Injectable()
export class LogiTableStyleService {
    public manualWidthConfigPx(): Observable<readonly (string | null)[]> {
        return combineLatest(
            [this._tableWidthConfigPx$, this._listOfThWidthConfigPx$],
        ).pipe(map((
            [widthConfig, listOfWidth],
        ) => (widthConfig.length ? widthConfig : listOfWidth)))
    }

    public setTheadTemplate(template: TemplateRef<LogiSafeAny>): void {
        this._theadTemplate$.next(template)
    }

    public theadTemplate(): ReplaySubject<TemplateRef<LogiSafeAny>> {
        return this._theadTemplate$
    }

    public setHasFixLeft(hasFixLeft: boolean): void {
        this._hasFixLeft$.next(hasFixLeft)
    }

    public hasFixLeft(): ReplaySubject<boolean> {
        return this._hasFixLeft$
    }

    public setHasFixRight(hasFixRight: boolean): void {
        this._hasFixRight$.next(hasFixRight)
    }

    public hasFixRight(): ReplaySubject<boolean> {
        return this._hasFixRight$
    }

    public setTableWidthConfig(widthConfig: readonly (string | null)[]): void {
        this._tableWidthConfigPx$.next(widthConfig)
    }

    public setListOfTh(listOfTh: readonly LogiThMeasureDirective[]): void {
        let columnCount = 0
        listOfTh.forEach(th => {
            columnCount += th.validColSpan
        })
        const listOfThPx = listOfTh.map(item => item.logiWidth)
        this._columnCount$.next(columnCount)
        this._listOfThWidthConfigPx$.next(listOfThPx)
    }

    public setListOfMeasureColumn(
        listOfTh: readonly LogiThMeasureDirective[],
    ): void {
        const listOfKeys: string[] = []
        listOfTh.forEach(th => {
            const length = th.validColSpan
            for (let i = 0; i < length; i += 1)
                listOfKeys.push(`measure_key_${i}`)
        })
        this._listOfMeasureColumn$.next(listOfKeys)
    }

    public setListOfAutoWidth(
        listOfAutoWidth: readonly HTMLTableRowElement[],
    ): void {
        this._listOfTds$.next(listOfAutoWidth)
    }

    public setShowEmpty(showEmpty: boolean): void {
        this._showEmpty$.next(showEmpty)
    }

    public showEmpty(): ReplaySubject<boolean> {
        return this._showEmpty$
    }

    public listOfMeasureColumn(): ReplaySubject<readonly string[]> {
        return this._listOfMeasureColumn$
    }

    public hostWidth(): ReplaySubject<number> {
        return this._hostWidth$
    }

    public setScrollNearBottom(): void {
        this._scrollNearBottom$.next()
    }

    public scrollNearBottom(): Observable<void> {
        return this._scrollNearBottom$
    }

    public columnCount(): ReplaySubject<number> {
        return this._columnCount$
    }

    public listOfListOfThWidth(): Observable<readonly number[]> {
        return this._listOfTds$
            .pipe(map(tds => tds.map(td => td.getBoundingClientRect().width)))
    }
    private _theadTemplate$ = new ReplaySubject<TemplateRef<LogiSafeAny>>(1)
    private _hasFixLeft$ = new ReplaySubject<boolean>(1)
    private _hasFixRight$ = new ReplaySubject<boolean>(1)
    private _hostWidth$ = new ReplaySubject<number>(1)
    private _columnCount$ = new ReplaySubject<number>(1)
    private _showEmpty$ = new ReplaySubject<boolean>(1)
    private _scrollNearBottom$ = new Subject<void>()
    private _listOfThWidthConfigPx$ =
        new BehaviorSubject<readonly(string | null)[]>([])
    private _tableWidthConfigPx$ =
        new BehaviorSubject<readonly(string | null)[]>([])
    private _listOfTds$ =
        new ReplaySubject<readonly HTMLTableRowElement[]>(1)
    private _listOfMeasureColumn$ = new ReplaySubject<readonly string[]>(1)
}
