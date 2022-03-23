import {Builder} from '@logi/base/ts/common/builder'

import {Result} from '../../base'

export const enum ChangedType {
    /**
     * User modified the value.
     */
    MODIFIED,
    /**
     * The value changed due to the modification by user.
     */
    EFFECTED,
    /**
     * The value is reset to the initial value.
     */
    RESET,
}

export interface SourceChanged {
    readonly row: string
    readonly col: string
    readonly oldValue: number | null
    readonly newValue: number | null
    readonly newText: string
    readonly type: ChangedType
}

class SourceChangedImpl implements SourceChanged {
    public row!: string
    public col!: string
    public oldValue!: number | null
    public newValue!: number | null
    public type!: ChangedType
    public newText!: string
}

export class SourceChangedBuilder
    extends Builder<SourceChanged, SourceChangedImpl> {
    public constructor(obj?: Readonly<SourceChanged>) {
        const impl = new SourceChangedImpl()
        if (obj)
            SourceChangedBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public oldValue(oldValue: number | null): this {
        this.getImpl().oldValue = oldValue
        return this
    }

    public newValue(newValue: number | null): this {
        this.getImpl().newValue = newValue
        return this
    }

    public type(type: ChangedType): this {
        this.getImpl().type = type
        return this
    }

    public newText(text: string): this {
        this.getImpl().newText = text
        return this
    }

    protected get daa(): readonly string[] {
        return SourceChangedBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'col',
    ]
}

export interface PlaygroundResult extends Result {
    readonly changed: readonly SourceChanged[]
}

class PlaygroundResultImpl implements PlaygroundResult {
    public actionType!: number
    public changed: readonly SourceChanged[] = []
}

export class PlaygroundResultBuilder extends
    Builder<PlaygroundResult, PlaygroundResultImpl> {
    public constructor(obj?: Readonly<PlaygroundResult>) {
        const impl = new PlaygroundResultImpl()
        if (obj)
            PlaygroundResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public changed(changed: readonly SourceChanged[]): this {
        this.getImpl().changed = changed
        return this
    }

    public actionType(type: number): this {
        this.getImpl().actionType = type
        return this
    }
}

export function isPlaygroundResult(value: unknown): value is PlaygroundResult {
    return value instanceof PlaygroundResultImpl
}
