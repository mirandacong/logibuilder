import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ModifierManager} from '@logi/src/lib/modifier'

import {Result} from '../base'

export interface ModifierResult extends Result {
    readonly actionType: number
    readonly modifierManager: ModifierManager
}

class ModifierResultImpl implements Impl<ModifierResult> {
    public actionType!: number
    public modifierManager!: ModifierManager
}

export class ModifierResultBuilder extends
    Builder<ModifierResult, ModifierResultImpl> {
    public constructor(obj?: Readonly<ModifierResult>) {
        const impl = new ModifierResultImpl()
        if (obj)
            ModifierResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public modifierManager(modifierManager: ModifierManager): this {
        this.getImpl().modifierManager = modifierManager
        return this
    }

    protected get daa(): readonly string[] {
        return ModifierResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'modifierManager',
    ]
}

export function isModifierResult(value: unknown): value is ModifierResult {
    return value instanceof ModifierResultImpl
}

export function assertIsModifierResult(
    value: unknown,
): asserts value is ModifierResult {
    if (!(value instanceof ModifierResultImpl))
        throw Error('Not a ModifierResult!')
}
