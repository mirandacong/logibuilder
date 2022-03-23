import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    DefaultHeaderPayloadBuilder,
    Payload,
    RemoveStandardHeaderPayloadBuilder,
    SetRefHeaderPayloadBuilder,
    StdHeaderPayload,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    getNodesVisitor,
    isTable,
    NodeType,
    Table,
} from '@logi/src/lib/hierarchy/core'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly name: string
}

class ActionImpl implements Impl<Action> {
    public name!: string
    public actionType = ActionType.REMOVE_STD_HEADER
    public getPayloads(service: EditorService): readonly StdHeaderPayload[] {
        const payloads: Payload[] = []
        const add = new RemoveStandardHeaderPayloadBuilder()
            .name(this.name)
            .build()
        payloads.push(add)
        if (service.templateSet.defaultHeader === this.name)
            payloads.push(new DefaultHeaderPayloadBuilder()
                .defaultHeader(undefined)
                .build())
        const tables = preOrderWalk(
            service.book,
            getNodesVisitor,
            [NodeType.TABLE],
        ).filter(isTable).filter(t => t.referenceHeader === this.name)
        tables.forEach((t: Readonly<Table>): void => {
            payloads.push(new SetRefHeaderPayloadBuilder()
                .uuid(t.uuid)
                .referenceHeader(undefined)
                .build())
        })
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

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
