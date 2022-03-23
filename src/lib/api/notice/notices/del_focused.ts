import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {isSheet, isTable, Node, NodeType} from '@logi/src/lib/hierarchy/core'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface DelFocusedNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly node: Readonly<Node>
    getMessage(): Message
}

class DelFocusedNoticeImpl implements Impl<DelFocusedNotice> {
    public actionType!: number
    public success!: boolean
    public node!: Readonly<Node>
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const sheet = this.node.findParent(NodeType.SHEET)
        const table = this.node.findParent(NodeType.TABLE)
        if (!isSheet(sheet) || !isTable(table))
            return new MessageBuilder().main('').type(Type.ERROR).build()
        const path = `${sheet.name}/${table.name}`
        const main = this.success ? `成功移除关注指标 ${path}` : '移除关注指标失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class DelFocusedNoticeBuilder extends
    Builder<DelFocusedNotice, DelFocusedNoticeImpl> {
    public constructor(obj?: Readonly<DelFocusedNotice>) {
        const impl = new DelFocusedNoticeImpl()
        if (obj)
            DelFocusedNoticeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public success(success: boolean): this {
        this.getImpl().success = success
        return this
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    protected get daa(): readonly string[] {
        return DelFocusedNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'node',
        'actionType',
    ]
}

export function isDelFocusedNotice(value: unknown): value is DelFocusedNotice {
    return value instanceof DelFocusedNoticeImpl
}

export function assertIsDelFocusedNotice(
    value: unknown,
): asserts value is DelFocusedNotice {
    if (!(value instanceof DelFocusedNoticeImpl))
        throw Error('Not a DelFocusedNotice!')
}
