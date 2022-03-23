import {Injectable} from '@angular/core'
import {Table} from '@logi/src/lib/hierarchy/core'
import {Subject} from 'rxjs'

@Injectable()
export class AddFbService {
    public focusAddBtn(table: string): void {
        const btns = this._addBtnMap.get(table) ?? []
        this._lastTable = table
        btns.forEach(btn => {
            if (btn === undefined)
                return
            btn.classList.add('logi-focused')
        })
    }

    public getLastTable(): string | undefined {
        return this._lastTable
    }

    public setBtn(table: string, btn: HTMLButtonElement): void {
        const oldBtns = this._addBtnMap.get(table) ?? []
        this._addBtnMap.set(table, [...oldBtns, btn])
    }

    public tableDestroy(table: Readonly<Table>): void {
        this._addBtnMap.delete(table.uuid)
        this._tableDestroy$.next(table)
    }
    private readonly _tableDestroy$ = new Subject<Readonly<Table>>()
    private _lastTable?: string
    private _addBtnMap = new Map<string, readonly HTMLButtonElement[]>()
}
