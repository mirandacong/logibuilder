import {Builder} from '@logi/base/ts/common/builder'
import {
    AddChildPayloadBuilder,
    AddSlicePayloadBuilder,
    FocusHierarchyPayloadBuilder,
    Payload,
    SetIndentPayloadBuilder,
    SetItalicPayloadBuilder,
    SetPercentPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    isRow,
    RowBuilder,
    SliceExprBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {getChildIndex, getRowLevel} from './lib'

export interface Action extends Base {
    readonly target: string

}

class ActionImpl implements Action {
    public target!: string
    public actionType = ActionType.BASE_HISTORICAL_FORECAST
    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const payloads: Payload[] = []
        const node = nodesMap.get(this.target)
        if (node === undefined)
            return []
        if (!isRow(node))
            return []
        const pos = getChildIndex(node)
        const sliceOne = new SliceExprBuilder()
            .name('历史期')
            .expression(node.expression)
            .build()
        const sliceTwo = new SliceExprBuilder()
            .name('预测期')
            .expression(`{${node.name}}.lag(1y)*(1+{增长率@${node.name}})`)
            .build()
        const child = new RowBuilder().name('增长率').alias(node.name).build()
        const childSliceOne = new SliceExprBuilder()
            .name('历史期')
            .expression(`IFERROR({${node.name}}/{${node.name}}.lag(1y)-1,NULL)`)
            .build()
        const childSliceTwo = new SliceExprBuilder()
            .name('预测期')
            .expression(`{增长率@${node.name}}[历史期].average()`)
            .type(Type.ASSUMPTION)
            .build()
        if (child === undefined)
            return []
        const parent = node.parent
        if (parent === null)
            return []

        payloads.push(
            new AddSlicePayloadBuilder()
                .uuid(this.target)
                .slice(sliceOne)
                .build(),
            new AddSlicePayloadBuilder()
                .uuid(this.target)
                .slice(sliceTwo)
                .build(),
            new AddChildPayloadBuilder()
                .uuid(parent.uuid)
                .child(child)
                .position(pos + 1)
                .build(),
            new AddSlicePayloadBuilder()
                .uuid(child.uuid)
                .slice(childSliceOne)
                .build(),
            new AddSlicePayloadBuilder()
                .uuid(child.uuid)
                .slice(childSliceTwo)
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
