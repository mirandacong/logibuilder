import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Currency, Format} from '../format'
import {Manager} from '../manager'

export interface SetCurrencyModification extends Modification {
    readonly row: string
    readonly currency: Currency
}

class SetCurrencyModificationImpl implements Impl<SetCurrencyModification> {
    public row!: string
    public currency!: Currency
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastCurrency = mod.format.currency
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.currency = this.currency
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.currency = this._lastCurrency
    }

    private _lastCurrency = Currency.NONE
}

export class SetCurrencyModificationBuilder extends
    Builder<SetCurrencyModification, SetCurrencyModificationImpl> {
    public constructor(obj?: Readonly<SetCurrencyModification>) {
        const impl = new SetCurrencyModificationImpl()
        if (obj)
            SetCurrencyModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public currency(currency: Currency): this {
        this.getImpl().currency = currency
        return this
    }

    protected get daa(): readonly string[] {
        return SetCurrencyModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'currency',
    ]
}

export function isSetCurrencyModification(
    value: unknown,
): value is SetCurrencyModification {
    return value instanceof SetCurrencyModificationImpl
}

export function assertIsSetCurrencyModification(
    value: unknown,
): asserts value is SetCurrencyModification {
    if (!(value instanceof SetCurrencyModificationImpl))
        throw Error('Not a SetCurrencyModification!')
}
