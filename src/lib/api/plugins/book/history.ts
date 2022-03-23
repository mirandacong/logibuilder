import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {correctParent} from '@logi/src/lib/api/common'
import {Book} from '@logi/src/lib/hierarchy/core'

export interface History {
    canUndo(): boolean
    canRedo(): boolean
    undo(): void | Readonly<Book>
    redo(): void | Readonly<Book>
    add(root: Readonly<Book>): void
}

class HistoryImpl implements Impl<History> {
    public canUndo(): boolean {
        return this._undoStacks.length > 0
    }

    public canRedo(): boolean {
        return this._redoStacks.length > 0
    }

    public undo(): void | Readonly<Book> {
        if (this._curr !== undefined)
            this._redoStacks.push(this._curr)
        const result = this._undoStacks.pop()
        this._curr = result
        if (result !== undefined)
            correctParent(result)
        return result
    }

    public redo(): void | Readonly<Book> {
        if (this._curr !== undefined)
            this._undoStacks.push(this._curr)
        const result = this._redoStacks.pop()
        this._curr = result
        if (result !== undefined)
            correctParent(result)
        return result
    }

    public add(root: Readonly<Book>): void {
        if (this._curr !== undefined)
            this._undoStacks.push(this._curr)
        this._curr = root
        this._redoStacks = []
    }
    // tslint:disable-next-line: readonly-array
    private _undoStacks: Readonly<Book>[] = []
    // tslint:disable-next-line: readonly-array
    private _redoStacks: Readonly<Book>[] = []
    private _curr?: Readonly<Book>
}

export class HistoryBuilder extends Builder<History, HistoryImpl> {
    public constructor(obj?: Readonly<History>) {
        const impl = new HistoryImpl()
        if (obj)
            HistoryBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    protected get daa(): readonly string[] {
        return HistoryBuilder.__DAA_PROPS__
    }
}

export function isHistory(value: unknown): value is History {
    return value instanceof HistoryImpl
}

export function assertIsHistory(value: unknown): asserts value is History {
    if (!(value instanceof HistoryImpl))
        throw Error('Not a History!')
}
