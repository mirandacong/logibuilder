import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Font} from '../font'
import {Manager} from '../manager'

export interface SetBoldModification extends Modification {
    readonly row: string
    readonly bold: boolean
}

class SetBoldModificationImpl implements Impl<SetBoldModification> {
    public row!: string
    public bold!: boolean
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastBold = mod.font.bold
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.bold = this.bold
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.bold = this._lastBold
    }

    private _lastBold = false
}

export class SetBoldModificationBuilder extends
    Builder<SetBoldModification, SetBoldModificationImpl> {
    public constructor(obj?: Readonly<SetBoldModification>) {
        const impl = new SetBoldModificationImpl()
        if (obj)
            SetBoldModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public bold(bold: boolean): this {
        this.getImpl().bold = bold
        return this
    }

    protected get daa(): readonly string[] {
        return SetBoldModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'bold',
    ]
}

export function isSetBoldModification(
    value: unknown,
): value is SetBoldModification {
    return value instanceof SetBoldModificationImpl
}

export function assertIsSetBoldModification(
    value: unknown,
): asserts value is SetBoldModification {
    if (!(value instanceof SetBoldModificationImpl))
        throw Error('Not a SetBoldModification!')
}
