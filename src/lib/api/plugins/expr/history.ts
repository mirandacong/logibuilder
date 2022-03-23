export class History {
    public canUndo(): boolean {
        return this._undoStack.length > 0
    }

    public canRedo(): boolean {
        return this._redoStack.length > 0
    }

    public undo(): void | readonly [Set<string>, Set<string>] {
        const last = this._undoStack.pop()
        if (last === undefined)
            return
        this._redoStack.push(last)
        return last
    }

    public redo(): void | readonly [Set<string>, Set<string>] {
        const last = this._redoStack.pop()
        if (last === undefined)
            return
        this._undoStack.push(last)
        return last
    }

    public add(sets: readonly [Set<string>, Set<string>]): void {
        this._undoStack.push(sets)
        this._redoStack = []
    }

    // tslint:disable-next-line: readonly-array
    private _undoStack: (readonly [Set<string>, Set<string>])[] = []
    // tslint:disable-next-line: readonly-array
    private _redoStack: (readonly [Set<string>, Set<string>])[] = []
}
