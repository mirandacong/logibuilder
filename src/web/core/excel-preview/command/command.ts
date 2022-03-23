// tslint:disable-next-line: ter-max-len
// tslint:disable-next-line: no-import-side-effect no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {RedoActionBuilder, UndoActionBuilder} from '@logi/src/lib/api'
import {StudioApiService} from '@logi/src/web/global/api'

import {CommandName} from './enum'
import {
    getLeftMostSelection,
    isSameColSelection,
    isSameRowSelection,
} from './utils'

import GcSpread = GC.Spread.Sheets

/**
 * if need undo in this command
 * should add commands.undoTransaction(wbContext, options) at
 * if(isUndo){
 *    commands.undoTransaction(wbContext, options)
 *    return true
 * }
 */
export const CTRL_R = {
    canUndo: true,
    // tslint:disable-next-line: max-func-body-length
    execute: (
        wbContext: GcSpread.Workbook,
        // tslint:disable-next-line: unknown-instead-of-any
        options: any,
        isUndo: boolean,
    ): boolean => {
        const commands = GC.Spread.Sheets.Commands
        if (isUndo)
            return true
        /**
         * used for undo & redo like id
         */
        options.cmd = CommandName.CTRL_R
        const sheet = wbContext.getActiveSheet()
        const select = sheet.getSelections()
        /**
         * if the select row at the boundary of left,
         * the command should not excute
         */
        if (select[0].col === 0)
            return true
        /**
         * the change during transaction will saved
         * used for undo
         */
        commands.startTransaction(wbContext, options)
        /**
         * support copy cell style
         */
        wbContext.suspendPaint()

        let fromRanges: GcSpread.Range[] = []
        let toRanges: GcSpread.Range[] = []
        if (select.length === 1 && select[0].colCount === 1) {
            fromRanges = [
                new GC.Spread.Sheets.Range(
                    select[0].row,
                    select[0].col - 1,
                    select[0].rowCount,
                    select[0].colCount,
                ),
            ]
            toRanges = [
                new GC.Spread.Sheets.Range(
                    select[0].row,
                    select[0].col,
                    select[0].rowCount,
                    select[0].colCount,
                ),

            ]
        } else if (isSameColSelection(select)) {
            const leftMostSel = getLeftMostSelection(select)
            select.forEach((sel: GcSpread.Range) => {
                fromRanges.push(new GC.Spread.Sheets.Range(
                        leftMostSel.row,
                        leftMostSel.col,
                        leftMostSel.rowCount,
                        1,
                ))
                toRanges.push(new GC.Spread.Sheets.Range(
                        sel.row,
                        sel.col,
                        sel.rowCount,
                        sel.colCount,
                ))
            })
        } else
            select.forEach((sel: GcSpread.Range) => {
                if (sel.colCount <= 1)
                    return
                fromRanges.push(new GC.Spread.Sheets.Range(
                        sel.row,
                        sel.col,
                        sel.rowCount,
                        1,
                ))
                toRanges.push(new GC.Spread.Sheets.Range(
                        sel.row,
                        sel.col + 1,
                        sel.rowCount,
                        sel.colCount - 1,
                ))
            })
        for (let i = 0; i < fromRanges.length; i += 1)
            wbContext.commandManager().execute({
                clipboardText: '',
                cmd: 'clipboardPaste',
                fromRanges: [fromRanges[i]],
                fromSheet: sheet,
                isCutting: false,
                pasteOption: GC.Spread.Sheets.ClipboardPasteOptions.all,
                pastedRanges: [toRanges[i]],
                sheetName: sheet.name(),
            })
        wbContext.resumePaint()
        commands.endTransaction(wbContext, options)
        return true
    },
}

export const CTRL_D = {
    canUndo: true,
    // tslint:disable-next-line: max-func-body-length
    execute: (
        wbContext: GcSpread.Workbook,
        // tslint:disable-next-line: unknown-instead-of-any
        options: any,
        isUndo: boolean,
    ): boolean => {
        const commands = GC.Spread.Sheets.Commands
        if (isUndo)
            return true
        /**
         * used for undo & redo
         */
        options.cmd = CommandName.CTRL_D
        const sheet = wbContext.getActiveSheet()
        const select = sheet.getSelections()
        /**
         * if the select col at the boundary of top,
         * the command should not excute
         */
        if (select[0].row === 0)
            return true

        commands.startTransaction(wbContext, options)
        wbContext.suspendPaint()

        let fromRanges: GcSpread.Range[] = []
        let toRanges: GcSpread.Range[] = []
        if (select.length === 1 && select[0].rowCount === 1) {
            fromRanges = [
                new GC.Spread.Sheets.Range(
                    select[0].row - 1,
                    select[0].col,
                    select[0].rowCount,
                    select[0].colCount,
                ),
            ]
            toRanges = [
                new GC.Spread.Sheets.Range(
                    select[0].row,
                    select[0].col,
                    select[0].rowCount,
                    select[0].colCount,
                ),

            ]
        } else if (isSameRowSelection(select)) {
            const leftMostSel = getLeftMostSelection(select)
            select.forEach((sel: GcSpread.Range) => {
                fromRanges.push(new GC.Spread.Sheets.Range(
                        leftMostSel.row,
                        leftMostSel.col,
                        1,
                        leftMostSel.colCount,
                ))
                toRanges.push(new GC.Spread.Sheets.Range(
                        sel.row,
                        sel.col,
                        sel.rowCount,
                        sel.colCount,
                ))
            })
        } else
            select.forEach((sel: GcSpread.Range) => {
                if (sel.rowCount <= 1)
                    return
                fromRanges.push(new GC.Spread.Sheets.Range(
                        sel.row,
                        sel.col,
                        1,
                        sel.colCount,
                ))
                toRanges.push(new GC.Spread.Sheets.Range(
                        sel.row + 1,
                        sel.col,
                        sel.rowCount - 1,
                        sel.colCount,
                ))
            })
        for (let i = 0; i < fromRanges.length; i += 1)
            wbContext.commandManager().execute({
                clipboardText: '',
                cmd: 'clipboardPaste',
                fromRanges: [fromRanges[i]],
                fromSheet: sheet,
                isCutting: false,
                pasteOption: GC.Spread.Sheets.ClipboardPasteOptions.all,
                pastedRanges: [toRanges[i]],
                sheetName: sheet.name(),
            })
        wbContext.resumePaint()
        commands.endTransaction(wbContext, options)
        return true
    },
}

/**
 * Shortcut key (f2 to start edit cell)
 * https://www.grapecity.com/blogs/no-f2-key-in-spreadjs
 * https://www.grapecity.com/forums/spread-views/f2-key-binding#hi-davidethe-blog-post-ref
 */
export const F2 = {
    canUndo: false,
    execute: (
        wbContext: GcSpread.Workbook,
        // tslint:disable-next-line: unknown-instead-of-any
        options: any,
        isUndo: boolean,
    ): boolean => {
        if (isUndo)
            return true
        const sheet = wbContext.getSheetFromName(options.sheetName)
        if (sheet !== undefined && sheet !== null)
            sheet.startEdit()
        return true
    },
}

export function getUndoWithService(service: StudioApiService): object {
    return {
        canUndo: false,
        execute: (): void => {
            const action = new UndoActionBuilder().build()
            service.handleAction(action)
        },
    }
}

export function getRedoWithService(service: StudioApiService): object {
    return {
        canUndo: false,
        execute: (): void => {
            const action = new RedoActionBuilder().build()
            service.handleAction(action)
        },
    }
}
