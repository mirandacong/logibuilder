import {Builder} from '@logi/base/ts/common/builder'
import {ProducerVersionBuilder} from '@logi/base/ts/common/version'
import {BufferPayloadBuilder, Payload} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'

import {Action as Base} from './action'
import {ActionType} from './type'

export interface MultiWindowAction extends Base {
    readonly subAction?: Base
}

class ActionImpl implements MultiWindowAction {
    public actionType = ActionType.MULTI_WINDOW
    public subAction?: Base
    public getPayloads(
        service: EditorService,
    ): readonly Payload[] | Observable<readonly Payload[]> {
        const version = new ProducerVersionBuilder()
            .minConsumer(1)
            .producer(1)
            .build()
        const bufferPayload = new BufferPayloadBuilder()
            .version(version)
            .build()
        if (this.subAction === undefined)
            return [bufferPayload]
        const subPayloads = this.subAction.getPayloads(service)
        if (subPayloads instanceof Observable)
            return subPayloads.pipe(map((
                p: readonly Payload[],
            ): readonly Payload[] => [...p, bufferPayload]))
        return [...subPayloads, bufferPayload]
    }
}

export class MultiWindowActionBuilder extends
    Builder<MultiWindowAction, ActionImpl> {
    public constructor(obj?: Readonly<MultiWindowAction>) {
        const impl = new ActionImpl()
        if (obj)
            MultiWindowActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public subAction(subAction: Base): this {
        this.getImpl().subAction = subAction
        return this
    }
}

export function isMultiWindowAction(
    value: unknown,
): value is MultiWindowAction {
    return value instanceof ActionImpl
}

export function assertIsMultiWindowAction(
    value: unknown,
): asserts value is MultiWindowAction {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
