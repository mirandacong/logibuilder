import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Font} from '../font'
import {Manager} from '../manager'

export interface SetSizeModification extends Modification {
    readonly row: string
    readonly size: number
}

class SetSizeModificationImpl implements Impl<SetSizeModification> {
    public row!: string
    public size!: number
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastSize = mod.font.size
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.size = this.size
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.size = this._lastSize
    }

    private _lastSize = 10
}

export class SetSizeModificationBuilder extends
    Builder<SetSizeModification, SetSizeModificationImpl> {
    public constructor(obj?: Readonly<SetSizeModification>) {
        const impl = new SetSizeModificationImpl()
        if (obj)
            SetSizeModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public size(size: number): this {
        this.getImpl().size = size
        return this
    }

    protected get daa(): readonly string[] {
        return SetSizeModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'size',
    ]
}

export function isSetSizeModification(
    value: unknown,
): value is SetSizeModification {
    return value instanceof SetSizeModificationImpl
}

export function assertIsSetSizeModification(
    value: unknown,
): asserts value is SetSizeModification {
    if (!(value instanceof SetSizeModificationImpl))
        throw Error('Not a SetSizeModification!')
}
