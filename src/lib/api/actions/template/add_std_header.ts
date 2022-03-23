import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    Payload,
    SetStandardHeaderPayloadBuilder,
    StdHeaderPayload,
} from '@logi/src/lib/api/payloads'
import {StandardHeader} from '@logi/src/lib/template'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly stdHeader: StandardHeader
}

class ActionImpl implements Impl<Action> {
    public stdHeader!: StandardHeader
    public actionType = ActionType.ADD_STD_HEADER
    public getPayloads(): readonly StdHeaderPayload[] {
        const payloads: Payload[] = []
        const add = new SetStandardHeaderPayloadBuilder()
            .standardHeader(this.stdHeader)
            .build()
        payloads.push(add)
        return payloads
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public stdHeader(stdHeader: StandardHeader): this {
        this.getImpl().stdHeader = stdHeader
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'stdHeader',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
