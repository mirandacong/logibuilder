import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Format} from '../format'
import {Manager} from '../manager'

export interface SetThousandsSeparatorModification extends Modification {
    readonly row: string
    readonly thousandsSeparator: boolean
}

class SetThousandsSeparatorModificationImpl implements
    Impl<SetThousandsSeparatorModification> {
    public row!: string
    public thousandsSeparator!: boolean
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastPercent = mod.format.thousandsSeparator
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.thousandsSeparator = this.thousandsSeparator
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.thousandsSeparator = this._lastPercent
    }

    private _lastPercent = true
}

export class SetThousandsSeparatorModificationBuilder extends Builder<
    SetThousandsSeparatorModification, SetThousandsSeparatorModificationImpl> {
    public constructor(obj?: Readonly<SetThousandsSeparatorModification>) {
        const impl = new SetThousandsSeparatorModificationImpl()
        if (obj)
            SetThousandsSeparatorModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public thousandsSeparator(thousandsSeparator: boolean): this {
        this.getImpl().thousandsSeparator = thousandsSeparator
        return this
    }

    protected get daa(): readonly string[] {
        return SetThousandsSeparatorModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'thousandsSeparator',
    ]
}

export function isSetThousandsSeparatorModification(
    value: unknown,
): value is SetThousandsSeparatorModification {
    return value instanceof SetThousandsSeparatorModificationImpl
}

export function assertIsSetThousandsSeparatorModification(
    value: unknown,
): asserts value is SetThousandsSeparatorModification {
    if (!(value instanceof SetThousandsSeparatorModificationImpl))
        throw Error('Not a SetThousandsSeparatorModification!')
}
