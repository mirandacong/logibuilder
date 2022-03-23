import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Font} from '../font'
import {Manager} from '../manager'

export interface SetIndentModification extends Modification {
    readonly row: string
    readonly indent: number
}

class SetIndentModificationImpl implements Impl<SetIndentModification> {
    public row!: string
    public indent!: number
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastIndent = mod.font.indent
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.indent = this.indent
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.indent = this._lastIndent
    }

    private _lastIndent = 0
}

export class SetIndentModificationBuilder extends
    Builder<SetIndentModification, SetIndentModificationImpl> {
    public constructor(obj?: Readonly<SetIndentModification>) {
        const impl = new SetIndentModificationImpl()
        if (obj)
            SetIndentModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public indent(indent: number): this {
        this.getImpl().indent = indent
        return this
    }

    protected get daa(): readonly string[] {
        return SetIndentModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'indent',
    ]
}

export function isSetIndentModification(
    value: unknown,
): value is SetIndentModification {
    return value instanceof SetIndentModificationImpl
}

export function assertIsSetIndentModification(
    value: unknown,
): asserts value is SetIndentModification {
    if (!(value instanceof SetIndentModificationImpl))
        throw Error('Not a SetIndentModification!')
}
