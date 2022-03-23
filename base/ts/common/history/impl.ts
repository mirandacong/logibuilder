/**
 * A base template for class that needs undo/redo.
 */
export abstract class History {
    /**
     * Whether the execution of the `apply` function is recorded.
     */
    public get changed(): boolean {
        const result = this._changed
        this._changed = false
        return result
    }

    public undo(): void {
        const last = this._undoStack.pop()
        if (last === undefined)
            return
        this._redoStack.push(last)
        for (let i = last.length - 1; i >= 0 ; i -= 1)
            last[i].undo(this)
    }

    public redo(): void {
        const last = this._redoStack.pop()
        if (last === undefined)
            return
        this._undoStack.push(last)
        last.forEach((m: Modification): void => {
            m.do(this)
        })
    }

    public canUndo(): boolean {
        return this._undoStack.length > 0
    }

    public canRedo(): boolean {
        return this._redoStack.length > 0
    }

    /**
     * Apply the modifications and store them in undo stack.
     */

    public apply(ms: readonly Modification[]): void {
        this._changed = true
        ms.forEach((m: Modification): void => {
            m.do(this)
        })
        this._undoStack.push(ms)
        this._redoStack = []
    }
    private _changed = false

    // tslint:disable-next-line: readonly-array
    private _undoStack: (readonly Modification[])[] = []
    // tslint:disable-next-line: readonly-array
    private _redoStack: (readonly Modification[])[] = []
}

/**
 * The atomic operation.
 */
export abstract class Modification {
    /**
     * Forward operation, used in redo.
     */
    public abstract do(hist: History): void

    /**
     * Backward operation, used in undo.
     */
    public abstract undo(hist: History): void
}
