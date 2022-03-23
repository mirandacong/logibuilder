import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    Payload,
    RenameSheetPayloadBuilder,
    SetNamePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isSheet} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {renameReferenceNode} from './lib'

/**
 * Set name to targetnode.
 */
export interface Action extends Base {
    readonly target: string
    readonly name: string
}

class ActionImpl implements Action {
    public target!: string
    public name!: string
    public actionType = ActionType.SET_NAME
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const bookMap = service.bookMap
        const payloads: Payload[] = []
        const name = this.name.trim()
        const node = bookMap.get(this.target)
        if (node === undefined || node.name === name)
            return []
        if (isSheet(node))
            payloads.push(new RenameSheetPayloadBuilder()
                .oldName(node.name)
                .name(name)
                .build())
        else
            payloads.push(new SetNamePayloadBuilder()
                .uuid(this.target)
                .name(name)
                .build())
        const focus = new FocusHierarchyPayloadBuilder()
            .uuid(this.target)
            .build()
        payloads.push(focus)
        payloads.push(...renameReferenceNode(node, name, service))
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

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
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
