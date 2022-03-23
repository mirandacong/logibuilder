import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Font, FontFamily} from '../font'
import {Manager} from '../manager'

export interface SetFamilyModification extends Modification {
    readonly row: string
    readonly family: FontFamily
}

class SetFamilyModificationImpl implements Impl<SetFamilyModification> {
    public row!: string
    public family!: FontFamily
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastFamily = mod.font.family
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.family = this.family
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.family = this._lastFamily
    }

    private _lastFamily = FontFamily.CALIBRI
}

export class SetFamilyModificationBuilder
    extends Builder<SetFamilyModification, SetFamilyModificationImpl> {
    public constructor(obj?: Readonly<SetFamilyModification>) {
        const impl = new SetFamilyModificationImpl()
        if (obj)
            SetFamilyModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public family(family: FontFamily): this {
        this.getImpl().family = family
        return this
    }

    protected get daa(): readonly string[] {
        return SetFamilyModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'family',
    ]
}

export function isSetFamilyModification(
    value: unknown,
): value is SetFamilyModification {
    return value instanceof SetFamilyModificationImpl
}

export function assertIsSetFamilyModification(
    value: unknown,
): asserts value is SetFamilyModification {
    if (!(value instanceof SetFamilyModificationImpl))
        throw Error('Not a SetFamilyModification!')
}
