import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetHeaderStubPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * Set stub to table
 */
export interface Action extends Base {
    readonly target: string
    readonly stub: string
}

class ActionImpl implements Action {
    public target!: string
    public stub!: string
    public actionType = ActionType.SET_HEADER_STUB
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const node = nodesMap.get(this.target)
        if (node === undefined)
            return []
        const payloads: HierarchyPayload[] = []
        payloads.push(new SetHeaderStubPayloadBuilder()
            .uuid(this.target)
            .stub(this.stub)
            .build())
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(this.target)
            .build()
        payloads.push(focus)
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

    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public stub(stub: string): this {
        this.getImpl().stub = stub
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
        'stub',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
