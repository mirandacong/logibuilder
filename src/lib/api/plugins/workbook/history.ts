import {SpreadsheetPayload} from '@logi/src/lib/spreadsheet'

export class History {
    public undo(): readonly SpreadsheetPayload[] | undefined {
        const last = this._undoStack.pop()
        if (last === undefined)
            return
        this._redoStack.push(last)
        return last
    }

    public redo(): readonly SpreadsheetPayload[] | undefined {
        const last = this._redoStack.pop()
        if (last === undefined)
            return
        this._undoStack.push(last)
        return last
    }

    public canUndo(): boolean {
        return this._undoStack.length > 0
    }

    public canRedo(): boolean {
        return this._redoStack.length > 0
    }

    public getStack(): readonly (readonly SpreadsheetPayload[])[] {
        return this._undoStack
    }

    public add(move: readonly SpreadsheetPayload[]): void {
        this._undoStack.push(move)
    }

    // tslint:disable-next-line: readonly-array
    private _undoStack: (readonly SpreadsheetPayload[])[] = []
    // tslint:disable-next-line: readonly-array
    private _redoStack: (readonly SpreadsheetPayload[])[] = []
}
