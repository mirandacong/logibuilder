import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    FocusHierarchyPayloadBuilder,
    FocusSourcePayloadBuilder,
    Payload,
    RemoveAnnotationPayloadBuilder,
    SetSourcePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    AnnotationKey,
    Column,
    isRow,
    isTable,
} from '@logi/src/lib/hierarchy/core'
import {DatabaseSourceBuilder} from '@logi/src/lib/source'

import {ActionType} from '../type'

import {Action as Base} from './base'

export interface Action extends Base {
    /**
     * uuid of row.
     */
    readonly target: string
    /**
     * Whether remove the linked source.
     */
    readonly removeSource: boolean
}

class ActionImpl implements Impl<Action> {
    public target!: string
    public removeSource = true
    public actionType = ActionType.REMOVE_DB_DATA

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: Readonly<EditorService>): readonly Payload[] {
        const nodesMap = service.bookMap
        const row = nodesMap.get(this.target)
        if (!isRow(row))
            return []
        const payloads: Payload[] = []
        payloads.push(new RemoveAnnotationPayloadBuilder()
            .uuid(this.target)
            .key(AnnotationKey.LINK_NAME)
            .build())
        payloads.push(new RemoveAnnotationPayloadBuilder()
            .uuid(this.target)
            .key(AnnotationKey.LINK_CODE)
            .build())
        const f = new FocusHierarchyPayloadBuilder().uuid(this.target).build()
        payloads.push(f)
        if (!this.removeSource)
            return payloads
        const table = row.getTable()
        if (!isTable(table))
            return payloads
        table.getLeafCols().forEach((col: Readonly<Column>): void => {
            const source = new DatabaseSourceBuilder().value('').build()
            const p = new SetSourcePayloadBuilder()
                .row(this.target)
                .col(col.uuid)
                .source(source)
                .build()
            payloads.push(p)
            const focus = new FocusSourcePayloadBuilder()
                .row(this.target)
                .col(col.uuid)
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
    public target(target: string): this {
        this.getImpl().target = target
        return this
    }

    public removeSource(removeSource: boolean): this {
        this.getImpl().removeSource = removeSource
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
