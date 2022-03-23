import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Format} from '../format'
import {Manager} from '../manager'

export interface SetPercentModification extends Modification {
    readonly row: string
    readonly percent: boolean
}

class SetPercentModificationImpl implements Impl<SetPercentModification> {
    public row!: string
    public percent!: boolean
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastPercent = mod.format.percent
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.percent = this.percent
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const format = mod.format as Writable<Format>
        format.percent = this._lastPercent
    }

    private _lastPercent = false
}

export class SetPercentModificationBuilder extends
    Builder<SetPercentModification, SetPercentModificationImpl> {
    public constructor(obj?: Readonly<SetPercentModification>) {
        const impl = new SetPercentModificationImpl()
        if (obj)
            SetPercentModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public percent(percent: boolean): this {
        this.getImpl().percent = percent
        return this
    }

    protected get daa(): readonly string[] {
        return SetPercentModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'percent',
    ]
}

export function isSetPercentModification(
    value: unknown,
): value is SetPercentModification {
    return value instanceof SetPercentModificationImpl
}

export function assertIsSetPercentModification(
    value: unknown,
): asserts value is SetPercentModification {
    if (!(value instanceof SetPercentModificationImpl))
        throw Error('Not a SetPercentModification!')
}
