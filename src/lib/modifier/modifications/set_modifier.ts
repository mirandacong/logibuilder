import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Writable} from '@logi/base/ts/common/mapped_types'

import {Modifier, ModifierBuilder} from '../base'
import {Manager} from '../manager'

export interface SetModifierModification extends Modification {
    readonly row: string
    readonly modifier: Modifier
}

class SetModifierModificationImpl implements SetModifierModification {
    public row!: string
    public modifier!: Modifier
    public do(manager: Manager): void {
        // tslint:disable-next-line: no-type-assertion
        const mod = manager.getModifier(this.row) as Writable<Modifier>
            ?? manager.buildModifier(this.row)
        this._lastModifier = new ModifierBuilder(mod).build()
        mod.font = this.modifier.font
        mod.format = this.modifier.format
    }

    public undo(manager: Manager): void {
        // tslint:disable-next-line: no-type-assertion
        const mod = manager.getModifier(this.row) as Writable<Modifier>
            ?? manager.buildModifier(this.row)
        mod.font = this._lastModifier.font
        mod.format = this._lastModifier.format
    }

    private _lastModifier!: Modifier
}

export class SetModifierModificationBuilder extends
    Builder<SetModifierModification, SetModifierModificationImpl> {
    public constructor(obj?: Readonly<SetModifierModification>) {
        const impl = new SetModifierModificationImpl()
        if (obj)
            SetModifierModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public modifier(modifier: Modifier): this {
        this.getImpl().modifier = modifier
        return this
    }

    protected get daa(): readonly string[] {
        return SetModifierModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'modifier',
    ]
}
