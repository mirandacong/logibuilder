import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {isSheet, isTable, Node, NodeType} from '@logi/src/lib/hierarchy/core'

import {Message, MessageBuilder, Type} from '../message'
import {Notice} from '../notice'

export interface DelAsmNotice extends Notice {
    readonly actionType: number
    readonly success: boolean
    readonly node: Readonly<Node>
    readonly sliceName: string
    getMessage(): Message
}

class DelAsmNoticeImpl implements Impl<DelAsmNotice> {
    public actionType!: number
    public success!: boolean
    public node!: Readonly<Node>
    public sliceName!: string
    public getMessage(): Message {
        const type = this.success ? Type.SUCCESS : Type.ERROR
        const sheet = this.node.findParent(NodeType.SHEET)
        const table = this.node.findParent(NodeType.TABLE)
        if (!isSheet(sheet) || !isTable(table))
            return new MessageBuilder().main('').type(Type.ERROR).build()
        let path = `${sheet.name}/${table.name}/${this.node.name}`
        if (this.sliceName !== '')
            path = `${path}[${this.sliceName}]`
        const main = this.success ? `成功移除假设 ${path}` : '移除假设失败'
        return new MessageBuilder().main(main).type(type).build()
    }
}

export class DelAsmNoticeBuilder extends
    Builder<DelAsmNotice, DelAsmNoticeImpl> {
    public constructor(obj?: Readonly<DelAsmNotice>) {
        const impl = new DelAsmNoticeImpl()
        if (obj)
            DelAsmNoticeBuilder.shallowCopy(impl, obj)
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

    public sliceName(sliceName: string): this {
        this.getImpl().sliceName = sliceName
        return this
    }

    protected get daa(): readonly string[] {
        return DelAsmNoticeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'success',
        'node',
        'sliceName',
        'actionType',
    ]
}

export function isDelAsmNotice(value: unknown): value is DelAsmNotice {
    return value instanceof DelAsmNoticeImpl
}

export function assertIsDelAsmNotice(
    value: unknown,
): asserts value is DelAsmNotice {
    if (!(value instanceof DelAsmNoticeImpl))
        throw Error('Not a DelAsmNotice!')
}
