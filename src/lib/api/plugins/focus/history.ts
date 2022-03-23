import {HierarhcyFocus, SourceFocus} from './result'

export class History {
    public add(
        hierarchy: readonly HierarhcyFocus[],
        source: readonly SourceFocus[],
    ): void {
        this._undoStack.push([hierarchy, source])
        this._redoStack = []
    }

    public undo(): undefined |
        readonly [readonly HierarhcyFocus[], readonly SourceFocus[]] {
        const result = this._undoStack.pop()
        if (result === undefined)
            return
        this._redoStack.push(result)
        return result
    }

    public redo(): undefined |
        readonly [readonly HierarhcyFocus[], readonly SourceFocus[]] {
        const result = this._redoStack.pop()
        if (result === undefined)
            return
        this._undoStack.push(result)
        return result
    }

    private _undoStack:
        // tslint:disable-next-line: readonly-array
        [readonly HierarhcyFocus[], readonly SourceFocus[]][] = []
    private _redoStack:
        // tslint:disable-next-line: readonly-array
        [readonly HierarhcyFocus[], readonly SourceFocus[]][] = []
}
