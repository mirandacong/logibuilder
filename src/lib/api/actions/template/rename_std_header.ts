import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    Payload,
    RenameStandardHeaderPayloadBuilder,
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
    readonly oldName: string
    readonly newName: string
}

class ActionImpl implements Impl<Action> {
    public oldName!: string
    public newName!: string
    public actionType = ActionType.RENAME_STD_HEADER
    public getPayloads(service: EditorService): readonly StdHeaderPayload[] {
        const payloads: Payload[] = []
        const rename = new RenameStandardHeaderPayloadBuilder()
            .oldName(this.oldName)
            .newName(this.newName)
            .build()
        payloads.push(rename)
        const tables = preOrderWalk2(
            service.book,
            getNodesVisitor,
            [NodeType.TABLE],
        ).filter(isTable).filter(t => t.referenceHeader === this.oldName)
        tables.forEach((t: Readonly<Table>): void => {
            payloads.push(new SetRefHeaderPayloadBuilder()
                .uuid(t.uuid)
                .referenceHeader(this.newName)
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

    public oldName(oldName: string): this {
        this.getImpl().oldName = oldName
        return this
    }

    public newName(newName: string): this {
        this.getImpl().newName = newName
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'oldName',
        'newName',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
