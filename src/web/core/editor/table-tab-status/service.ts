import {Injectable} from '@angular/core'
import {Node, NodeType} from '@logi/src/lib/hierarchy/core'
import {Observable, Subject} from 'rxjs'

export const enum TableTabView {
    COLUMN,
    ROW,
}

@Injectable()
/**
 * Service for tollbar and table
 */
export class TableTabStatusService {
    public getTabStatus(table: Readonly<Node>): TableTabView | undefined {
        return this._tableTabStatus.get(table.uuid)
    }

    public setTabStatus(table: Readonly<Node>, status: TableTabView): void {
        const oldStatus = this.getTabStatus(table)
        if (oldStatus === status)
            return
        this._tableTabStatus.set(table.uuid, status)
        this._statusChange$.next()
    }

    public listernTableTabChange(): Observable<void> {
        return this._statusChange$
    }

    public isRowView(node: Readonly<Node>): boolean {
        const table = node.findParent(NodeType.TABLE)
        if (!table)
            return true
        return this.getTabStatus(table) === TableTabView.ROW
    }

    private _statusChange$ = new Subject<void>()
    private _tableTabStatus = new Map<string, TableTabView>()
}
