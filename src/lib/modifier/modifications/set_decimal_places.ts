import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Format} from '../format'
import {Manager} from '../manager'

export interface SetDecimalPlacesModification extends Modification {
    readonly row: string
    readonly decimalPlaces: number
}

class SetDecimalPlacesModificationImpl implements
    Impl<SetDecimalPlacesModification> {
    public row!: string
    public decimalPlaces!: number
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastDecimalPlaces = mod.format.decimalPlaces
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.decimalPlaces = this.decimalPlaces
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.decimalPlaces = this._lastDecimalPlaces
    }

    private _lastDecimalPlaces = 2
}

export class SetDecimalPlacesModificationBuilder extends
    Builder<SetDecimalPlacesModification, SetDecimalPlacesModificationImpl> {
    public constructor(obj?: Readonly<SetDecimalPlacesModification>) {
        const impl = new SetDecimalPlacesModificationImpl()
        if (obj)
            SetDecimalPlacesModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public decimalPlaces(decimalPlaces: number): this {
        this.getImpl().decimalPlaces = decimalPlaces
        return this
    }

    protected get daa(): readonly string[] {
        return SetDecimalPlacesModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'decimalPlaces',
    ]
}

export function isSetDecimalPlacesModification(
    value: unknown,
): value is SetDecimalPlacesModification {
    return value instanceof SetDecimalPlacesModificationImpl
}

export function assertIsSetDecimalPlacesModification(
    value: unknown,
): asserts value is SetDecimalPlacesModification {
    if (!(value instanceof SetDecimalPlacesModificationImpl))
        throw Error('Not a SetDecimalPlacesModification!')
}
