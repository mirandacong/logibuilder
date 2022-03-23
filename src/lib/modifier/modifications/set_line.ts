import {Builder} from '@logi/base/ts/common/builder'
import {Underline} from '@logi/base/ts/common/excel'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Font} from '../font'
import {Manager} from '../manager'

export interface SetLineModification extends Modification {
    readonly row: string
    readonly line: Underline
}

class SetLineModificationImpl implements Impl<SetLineModification> {
    public row!: string
    public line!: Underline
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastLine = mod.font.line
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.line = this.line
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.line = this._lastLine
    }

    private _lastLine = Underline.NONE
}

export class SetLineModificationBuilder extends
    Builder<SetLineModification, SetLineModificationImpl> {
    public constructor(obj?: Readonly<SetLineModification>) {
        const impl = new SetLineModificationImpl()
        if (obj)
            SetLineModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public line(line: Underline): this {
        this.getImpl().line = line
        return this
    }

    protected get daa(): readonly string[] {
        return SetLineModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'line',
    ]
}

export function isSetLineModification(
    value: unknown,
): value is SetLineModification {
    return value instanceof SetLineModificationImpl
}

export function assertIsSetLineModification(
    value: unknown,
): asserts value is SetLineModification {
    if (!(value instanceof SetLineModificationImpl))
        throw Error('Not a SetLineModification!')
}
