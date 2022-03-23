import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    Payload,
    SetIndentPayloadBuilder,
    SetItalicPayloadBuilder,
    SetPercentPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {isRow, RowBuilder} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {getChildIndex, getRowLevel} from './lib'

export interface Action extends Base {
    readonly target: string

}

class ActionImpl implements Action {
    public target!: string
    public actionType = ActionType.GROWTH_RATE
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const payloads: Payload[] = []
        const node = nodesMap.get(this.target)
        if (node === undefined)
            return []
        if (!isRow(node))
            return []
        const pos = getChildIndex(node)
        const child = new RowBuilder()
            .name('增长率')
            .alias(node.name)
            .expression(`IFERROR({${node.name}}/{${node.name}}.lag(1y)-1,NULL)`)
            .build()
        if (child === undefined)
            return []
        const parent = node.parent
        if (parent === null)
            return []

        payloads.push(
            new AddChildPayloadBuilder()
                .uuid(parent.uuid)
                .child(child)
                .position(pos + 1)
                .build(),
            new FocusHierarchyPayloadBuilder().uuid(child.uuid).build(),
        )
        const percent = new SetPercentPayloadBuilder()
            .row(child.uuid)
            .percent(true)
            .build()
        const indent = new SetIndentPayloadBuilder()
            .row(child.uuid)
            // tslint:disable-next-line: no-magic-numbers
            .indent(getRowLevel(parent) + 2)
            .build()
        const italic = new SetItalicPayloadBuilder()
            .row(child.uuid)
            .italic(true)
            .build()
        payloads.push(percent, indent, italic)
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

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'target',
    ]
}
export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
