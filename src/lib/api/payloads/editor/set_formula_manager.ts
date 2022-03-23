import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {FormulaManager} from '@logi/src/lib/formula'

import {Payload, PayloadType} from '../payload'

export interface SetFormulaManagerPayload extends Payload {
    readonly formulaManager: FormulaManager
}

class SetFormulaManagerPayloadImpl
    implements Impl<SetFormulaManagerPayload> {
    public formulaManager!: FormulaManager
    public payloadType = PayloadType.SET_FORMULA_MANAGER
}

export class SetFormulaManagerPayloadBuilder extends Builder<
    SetFormulaManagerPayload, SetFormulaManagerPayloadImpl> {
    public constructor(obj?: Readonly<SetFormulaManagerPayload>) {
        const impl = new SetFormulaManagerPayloadImpl()
        if (obj)
            SetFormulaManagerPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public formulaManager(formulaManager: FormulaManager): this {
        this.getImpl().formulaManager = formulaManager
        return this
    }

    protected get daa(): readonly string[] {
        return SetFormulaManagerPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'formulaManager',
    ]
}

export function isSetFormulaManagerPayload(
    value: unknown,
): value is SetFormulaManagerPayload {
    return value instanceof SetFormulaManagerPayloadImpl
}

export function assertIsSetFormulaManagerPayload(
    value: unknown,
): asserts value is SetFormulaManagerPayload {
    if (!(value instanceof SetFormulaManagerPayloadImpl))
        throw Error('Not a SetFormulaManagerPayload!')
}
