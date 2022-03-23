import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import {assertIsNode, isRow} from '@logi/src/lib/hierarchy/core'
import {NodeFocusService} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api'
import {Subscription} from 'rxjs'

export interface RowData {
    readonly name: string
    readonly uuid: string
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-select-row-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SelectRowDialogComponent implements OnInit, OnDestroy {
    public constructor(
        private readonly _dialogRef: MatDialogRef<SelectRowDialogComponent>,
        private readonly _nodeFocusSvc: NodeFocusService,

        @Inject(MAT_DIALOG_DATA)
        private readonly _rowData: readonly RowData[],
        private readonly _studioApiSvc: StudioApiService,
    ) {
        this._updateControl(this._rowData)
    }

    public rowsControl = new FormControl()

    public ngOnInit(): void {
        this._subs
            .add(this._nodeFocusSvc.listenFocusChange().subscribe(infos => {
                const nodes = infos.map(n => {
                    const hierarchy = this._studioApiSvc.getNode(n.nodeId)
                    assertIsNode(hierarchy)
                    return hierarchy
                })
                if (nodes.some(n => !isRow(n)))
                    return
                const data = nodes.map(n => {
                    return {name: n.name, uuid: n.uuid}
                })
                this.update(data)
            }),)
    }

    public ngOnDestroy(): void {
        this._subs.unsubscribe()
    }

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public update(rows: readonly RowData[]): void {
        this._updateControl(rows)
    }

    public onConfirm(): void {
        this._dialogRef.close(this._rows)
    }

    public onCancel(): void {
        this._dialogRef.close(this._rows)
    }

    private _rows: readonly RowData[] = []
    private _subs = new Subscription()

    private _updateControl(rows: readonly RowData[]): void {
        this._rows = rows
        this.rowsControl.setValue(rows.map(r => r.name).join(','))
    }
}
