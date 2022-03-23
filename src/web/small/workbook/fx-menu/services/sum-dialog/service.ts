import {Injectable} from '@angular/core'
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
import {isRow} from '@logi/src/lib/hierarchy/core'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {
    RowData,
    SelectRowDialogComponent,
} from '@logi/src/web/small/workbook/fx-menu/services/select-row-dialog'
import {NotificationService} from '@logi/src/web/ui/notification'
import {Subscription} from 'rxjs'

import {SumDialogComponent} from './component'

@Injectable()
export class SumSnippetService {
    public constructor(
        private readonly _dialog: MatDialog,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _notificationSvc: NotificationService,
    ) { }

    public addSnippet (): void {
        const nodes = this._nodeFocusSvc.getSelNodes()
        if (nodes.length === 0) {
            this._notificationSvc.showWarning('当前未选中节点')
            return
        }
        if (nodes.some(n => !isRow(n))) {
            this._notificationSvc.showWarning('必须选中行节点')
            return
        }
        const rows = nodes.map(n => {
            return {name: n.name, uuid: n.uuid}
        })
        this._openSumDialog(rows)
    }

    public confirmSnippet (): void {
        this._focusSub?.unsubscribe()
    }

    public selectRow (rows: readonly RowData[]): void {
        if (this._selectDialogRef !== undefined)
            return
        if (this._sumDialogRef !== undefined)
            this._sumDialogRef.close()
        this._selectDialogRef = this._dialog.open(SelectRowDialogComponent, {
            data: rows,
            disableClose: true,
            hasBackdrop: false,
            width: '540px',
        })

        /**
         * Reopen the sum dialog when select dialog closed.
         */
        this._selectDialogRef.afterClosed().subscribe((
            data: readonly RowData[] | undefined,
        ) => {
            this._selectDialogRef = undefined
            this._openSumDialog(data ?? [])
        })
    }

    private _sumDialogRef?: MatDialogRef<SumDialogComponent, readonly Node[]>
    // tslint:disable-next-line: ter-max-len
    private _selectDialogRef?: MatDialogRef<SelectRowDialogComponent, readonly RowData[]>
    private _focusSub?: Subscription

    private _openSumDialog (rows: readonly RowData[]): void {
        if (this._sumDialogRef !== undefined)
            return
        this._sumDialogRef = this._dialog.open(SumDialogComponent, {
            data: rows,
            disableClose: true,
            hasBackdrop: false,
            width: '540px',
        })
        this._sumDialogRef.afterClosed().subscribe(() => {
            this._sumDialogRef = undefined
        })
    }
}
