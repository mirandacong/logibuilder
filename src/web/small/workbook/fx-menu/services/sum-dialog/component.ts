import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core'
import {FormControl} from '@angular/forms'
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {AddSumSnippetActionBuilder} from '@logi/src/lib/api'
import {
    assertIsNode,
    assertIsRow,
    assertIsSheet,
    getNodesVisitor,
    isRowBlock,
    isTable,
    NodeType,
    Row,
    RowBlock,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {
    RowData,
} from '@logi/src/web/small/workbook/fx-menu/services/select-row-dialog'
import {StudioApiService} from '@logi/src/web/global/api'

import {SumSnippetService} from './service'

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'logi-sum-dialog',
    styleUrls: ['./style.scss'],
    templateUrl: './template.html',
})
export class SumDialogComponent implements OnInit {
    public constructor(
        private readonly _dialogRef: MatDialogRef<SumDialogComponent>,

        @Inject(MAT_DIALOG_DATA)
        private readonly _rows: readonly RowData[],
        private readonly _studioApiSvc: StudioApiService,
        private readonly _sumSnippetSvc: SumSnippetService,
    ) {
        this._selectedRows = _rows
    }

    public rowsControl = new FormControl()
    public nameControl = new FormControl('')

    public updateSelected (rows: readonly RowData[]): void {
        this._selectedRows = rows
        this.rowsControl.setValue(rows.map(r => r.name).join(','))
    }

    public ngOnInit (): void {
        if (this._rows !== undefined)
            this.rowsControl.setValue(this._rows.map(n => n.name).join(','))
    }

    public onSelectRow (): void {
        this._sumSnippetSvc.selectRow(this._selectedRows)
    }

    public onConfirm (): void {
        this._sumSnippetSvc.confirmSnippet()
        this._dialogRef.close()
        if (this._selectedRows.length === 0)
            return
        const rows = this._selectedRows.map(r => {
            const hierarchy = this._studioApiSvc.getNode(r.uuid)
            assertIsRow(hierarchy)
            return hierarchy
        })
        const lastRow = getTheLastRow(rows)
        assertIsRow(lastRow)
        const parent = lastRow.parent
        assertIsNode(parent)
        if (!isTable(parent) && !isRowBlock(parent))
            return
        const tableOrBlock: Readonly<Table> | Readonly<RowBlock> = parent
        const name = this.nameControl.value
        let index = -1
        if (isTable(tableOrBlock))
            index = tableOrBlock.rows.indexOf(lastRow)
        if (isRowBlock(tableOrBlock))
            index = tableOrBlock.tree.indexOf(lastRow)
        const action = new AddSumSnippetActionBuilder()
            .rows(this._selectedRows.map(r => r.uuid))
            .name(name)
            .target(tableOrBlock.uuid)
            .position(index + 1)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public onCancel (): void {
        this._sumSnippetSvc.confirmSnippet()
        this._dialogRef.close()
    }

    private _selectedRows: readonly RowData[] = []
}

/**
 * All the rows should come from one sheet.
 */
function getTheLastRow (
    rows: readonly Readonly<Row>[],
): Readonly<Row> | undefined {
    if (rows.length === 0)
        return
    const sortingRows: Readonly<Row>[] = rows.slice()
    const sheet = sortingRows[0].findParent(NodeType.SHEET)
    assertIsSheet(sheet)
    const nodes = preOrderWalk2(sheet, getNodesVisitor, [
        NodeType.TABLE,
        NodeType.ROW_BLOCK,
        NodeType.ROW,
    ])
    const sortedRows = sortingRows.sort((a, b) =>
        nodes.indexOf(b) - nodes.indexOf(a))
    return sortedRows[sortedRows.length - 1]
}
