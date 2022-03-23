import {Builder} from '@logi/base/ts/common/builder'
import {buildDcfHeader} from '@logi/src/lib/api/methods'
import {
    AddChildPayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    RemoveChildPayloadBuilder,
    SetDataTypePayloadBuilder,
    SetRefHeaderPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    Column,
    ColumnBlock,
    ColumnBuilder,
    DataType,
    isTable,
    Row,
    SCALAR_HEADER,
    Table,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {updateHeaderUuidAndLabels} from './lib'

/**
 * Set header to tables and update stub, labels and cols of tables.
 */
export interface Action extends Base {
    readonly targets: readonly string[]
    readonly referenceHeader: string
}

class ActionImpl implements Action {
    public targets: readonly string[] = []
    public referenceHeader!: string
    public actionType = ActionType.SET_REF_HEADER
    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const nodesMap = service.bookMap
        const payloads: HierarchyPayload[] = []
        this.targets.forEach((target: string): void => {
            payloads.push(new SetRefHeaderPayloadBuilder()
                .uuid(target)
                .referenceHeader(this.referenceHeader)
                .build())
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(target)
                .build()
            payloads.push(focus)
        })
        if (this.referenceHeader === undefined)
            return payloads
        this.targets.forEach((target: string): void => {
            const table = nodesMap.get(target)
            if (!isTable(table))
                return
            if (table.referenceHeader === this.referenceHeader)
                return
            if (this.referenceHeader === SCALAR_HEADER)
                payloads.push(...getScalarHeaderPayloads(table))
            const stdHeader = service.templateSet.standardHeaders
                .find(h => h.name === this.referenceHeader)
            if (stdHeader === undefined)
                return
            const cb = buildDcfHeader(
                stdHeader.reportDate,
                stdHeader.headerInfos,
            )
            table.cols.forEach((c: Readonly<Column | ColumnBlock>): void => {
                const payload = new RemoveChildPayloadBuilder()
                    .child(c.uuid)
                    .uuid(target)
                    .build()
                payloads.push(payload)
            })
            cb.tree.slice().forEach((
                c: Readonly<Column | ColumnBlock>,
            ): void => {
                const payload = new AddChildPayloadBuilder()
                    .child(c)
                    .uuid(target)
                    .build()
                payloads.push(payload)
            })
            updateHeaderUuidAndLabels(table, cb)
            if (table.referenceHeader !== SCALAR_HEADER)
                return
            table.getLeafRows().forEach((row: Readonly<Row>): void => {
                payloads.push(new SetDataTypePayloadBuilder()
                    .uuid(row.uuid)
                    .dataType(DataType.NONE)
                    .build())
            })
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

    public referenceHeader(referenceHeader: string): this {
        this.getImpl().referenceHeader = referenceHeader
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'targets',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function getScalarHeaderPayloads(
    table: Readonly<Table>,
): readonly HierarchyPayload[] {
    const payloads: HierarchyPayload[] = []
    table.cols.forEach((c: Readonly<Column | ColumnBlock>): void => {
        const payload = new RemoveChildPayloadBuilder()
            .child(c.uuid)
            .uuid(table.uuid)
            .build()
        payloads.push(payload)
    })
    const col = new ColumnBuilder().name('').build()
    payloads.push(new AddChildPayloadBuilder()
        .uuid(table.uuid)
        .child(col)
        .build())
    table.getLeafRows().forEach((row: Readonly<Row>): void => {
        if (row.separator)
            return
        payloads.push(new SetDataTypePayloadBuilder()
            .uuid(row.uuid)
            .dataType(DataType.SCALAR)
            .build())
    })
    return payloads
}
