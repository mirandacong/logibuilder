import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {correctParent} from '@logi/src/lib/api/common'
import {Template, TemplateSet} from '@logi/src/lib/template'

export interface History {
    canUndo(): boolean
    canRedo(): boolean
    undo(): void | Readonly<TemplateSet>
    redo(): void | Readonly<TemplateSet>
    add(root: Readonly<TemplateSet>): void
}

class HistoryImpl implements Impl<History> {
    public canUndo(): boolean {
        return this._undoStacks.length > 0
    }

    public canRedo(): boolean {
        return this._redoStacks.length > 0
    }

    public undo(): void | Readonly<TemplateSet> {
        if (this._curr !== undefined)
            this._redoStacks.push(this._curr)
        const result = this._undoStacks.pop()
        this._curr = result
        if (result === undefined)
            return
        result.templates.forEach((t: Readonly<Template>): void => {
            correctParent(t.node)
        })
        return result
    }

    public redo(): void | Readonly<TemplateSet> {
        if (this._curr !== undefined)
            this._undoStacks.push(this._curr)
        const result = this._redoStacks.pop()
        this._curr = result
        if (result === undefined)
            return
        result.templates.forEach((t: Readonly<Template>): void => {
            correctParent(t.node)
        })
        return result
    }

    public add(root: Readonly<TemplateSet>): void {
        if (this._curr !== undefined)
            this._undoStacks.push(this._curr)
        this._curr = root
        this._redoStacks = []
    }
    // tslint:disable-next-line: readonly-array
    private _undoStacks: Readonly<TemplateSet>[] = []
    // tslint:disable-next-line: readonly-array
    private _redoStacks: Readonly<TemplateSet>[] = []
    private _curr?: Readonly<TemplateSet>
}

export class HistoryBuilder extends Builder<History, HistoryImpl> {
    public constructor(obj?: Readonly<History>) {
        const impl = new HistoryImpl()
        if (obj)
            HistoryBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isHistory(value: unknown): value is History {
    return value instanceof HistoryImpl
}

export function assertIsHistory(value: unknown): asserts value is History {
    if (!(value instanceof HistoryImpl))
        throw Error('Not a History!')
}
