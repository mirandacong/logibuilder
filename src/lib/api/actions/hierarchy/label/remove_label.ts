import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveLabelPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isNode, Label, Node} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

export interface Action extends Base {
    readonly targets: readonly string[]
    readonly label: Label
}

class ActionImpl implements Action {
    public targets: readonly string[] = []
    public label!: Label
    public actionType = ActionType.REMOVE_LABEL

    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const nodes = this.targets
            .map((uuid: string): Readonly<Node> | undefined =>
                nodesMap.get(uuid))
            .filter(isNode)
        const payloads: HierarchyPayload[] = []
        nodes.forEach((n: Readonly<Node>): void => {
            payloads.push(new RemoveLabelPayloadBuilder()
                .uuid(n.uuid)
                .label(this.label)
                .build())
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(n.uuid)
                .build()
            payloads.push(focus)
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

    public targets(targets: readonly string[]): this {
        this.getImpl().targets = targets
        return this
    }

    public label(label: Label): this {
        this.getImpl().label = label
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'label',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
