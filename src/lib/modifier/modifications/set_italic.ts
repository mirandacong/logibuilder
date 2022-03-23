import {Builder} from '@logi/base/ts/common/builder'
import {Modification} from '@logi/base/ts/common/history'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'

import {Font} from '../font'
import {Manager} from '../manager'

export interface SetItalicModification extends Modification {
    readonly row: string
    readonly italic: boolean
}

class SetItalicModificationImpl implements Impl<SetItalicModification> {
    public row!: string
    public italic!: boolean
    public do(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        this._lastItalic = mod.font.italic
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.italic = this.italic
    }

    public undo(manager: Manager): void {
        const mod = manager.getModifier(this.row)
            ?? manager.buildModifier(this.row)
        // tslint:disable-next-line: no-type-assertion
        const font = mod.font as Writable<Font>
        font.italic = this._lastItalic
    }

    private _lastItalic = false
}

export class SetItalicModificationBuilder extends
    Builder<SetItalicModification, SetItalicModificationImpl> {
    public constructor(obj?: Readonly<SetItalicModification>) {
        const impl = new SetItalicModificationImpl()
        if (obj)
            SetItalicModificationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public italic(italic: boolean): this {
        this.getImpl().italic = italic
        return this
    }

    protected get daa(): readonly string[] {
        return SetItalicModificationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'row',
        'italic',
    ]
}

export function isSetItalicModification(
    value: unknown,
): value is SetItalicModification {
    return value instanceof SetItalicModificationImpl
}

export function assertIsSetItalicModification(
    value: unknown,
): asserts value is SetItalicModification {
    if (!(value instanceof SetItalicModificationImpl))
        throw Error('Not a SetItalicModification!')
}
