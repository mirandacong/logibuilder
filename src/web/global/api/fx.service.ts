// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {Exception} from '@logi/base/ts/common/exception'
import {
    ClipboardResult,
    EditBarType,
    EditorService,
    Emitters,
    ErrorResult,
    FileResult,
    findNode,
    FocusResult,
    getEditBarStatus,
    Result,
    SheetTabsResult,
    suggestSliceNames,
} from '@logi/src/lib/api'
import {
    isFormulaBearer,
    isNode,
    isRow,
    Node,
    resolve,
    RowBuilder,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'
import {DisplayResponse, Event as EditorEvent} from '@logi/src/lib/intellisense'
import {Modifier} from '@logi/src/lib/modifier'
import {Observable} from 'rxjs'

import {BaseApiService} from './base'

export abstract class FxApiService extends BaseApiService {
    public sheetTabs(): Readonly<SheetTabsResult> {
        return this.api.sheetTabs()
    }

    /**
     * core edit
     */
    public isDuplicatedAlias(alias: string, row: string): boolean {
        const oldRow = this.api.bookMap.get(row)
        if (!isRow(oldRow))
            return false
        const newRow = new RowBuilder(oldRow).alias(alias).build()
        const path = newRow.getPath()
        const nodes = resolve(path, oldRow)
        if (nodes.length === 0)
            return false
        if (nodes.length > 1)
            return true
        return nodes[0].uuid !== row
    }

    /**
     * Get excel cell position ([row uuid, col uuid]).
     * This is used for updating source by editing cell in excel preview
     * component.
     * @param sheetName the current active sheet name.
     * @param row the row index in current sheet.
     * @param col the col index in current sheet.
     */
    public getExcelCellPos(
        sheetName: string,
        row: number,
        col: number,
    ): readonly [string, string] | Exception {
        return this.api.hsfManager.getCell(sheetName, row, col)
    }

    /**
     * Find a hierarchy node by the coordinate(row and col) and sheetName in
     * excel. It relies on the result of transpile because transpile have the
     * information of the coordinate of hierarchy node.
     *
     * Use this method in spreadjs sheet to find corresponding hierarchy node
     * by coordinate of excel cell and sheetName.
     */
    public findNodeByCoordinate(
        row: number,
        col: number,
        sheetName: string,
    ): Readonly<Node> | undefined {
        return findNode(row, col, sheetName, this.api)
    }

    public getActiveSheet(): string {
        return this.api.getActiveSheet()
    }

    public getDefaultStdHeader(): string | undefined {
        return this.api.templateSet.defaultHeader
    }

    public getClipboardSlices(): readonly string[] {
        return this.api.clipboard.slices
    }

    public getEditBarStatus(
        focus: readonly string[],
        type: EditBarType,
        slices?: readonly SliceExpr[],
    ): boolean {
        const nodes = focus
            .map((uuid: string): Readonly<Node> | undefined =>
            this.api.bookMap.get(uuid))
            .filter(isNode)
        return getEditBarStatus(nodes, type, this.api, slices)
    }

    public suggestSliceNames(
        fb: string,
        currSliceName: string,
    ): readonly string[] {
        const node = this.api.bookMap.get(fb)
        if (!isFormulaBearer(node))
            return []
        return suggestSliceNames(node, currSliceName)
    }

    public getEmitters(): Emitters {
        return this.api.getEmitters()
    }

    public getModifier(row: string): Modifier | undefined {
        return this.api.modifierManager.getModifier(row)
    }

    public errorInfoChange(): Observable<ErrorResult> {
        return this.getEmitters().errorEmitter
    }

    public sheetTabsChange(): Observable<SheetTabsResult> {
        return this.getEmitters().sheetTabsEmitter
    }

    public sourceChange(): Observable<Result> {
        return this.getEmitters().sourceEmitter
    }

    public clipboardChange(): Observable<ClipboardResult> {
        return this.getEmitters().clipboardEmitter
    }

    public downloadChange(): Observable<FileResult> {
        return this.getEmitters().downloadEmitter
    }

    public focusChange(): Observable<FocusResult> {
        return this.getEmitters().focusEmitter
    }

    public setWorkbook(excel: GC.Spread.Sheets.Workbook): void {
        return this.api.setWorkbook(excel)
    }

    public connect(
        event$: Observable<EditorEvent>,
    ): Observable<Observable<DisplayResponse>> {
        return this.api.connect(event$)
    }

    /**
     * Get node from uuid.
     * TODO(zecheng): Remove this function from frontend in the future when
     * frontend doesn't depend on hierarchy node absolutely.
     */
    public getNode(uuid: string): Readonly<Node> | undefined {
        return this.api.bookMap.get(uuid)
    }

    /**
     * TODO(zengkai): remove this method.
     */
    public getBackendService(): EditorService {
        return this.api
    }

    protected abstract api: EditorService
}
