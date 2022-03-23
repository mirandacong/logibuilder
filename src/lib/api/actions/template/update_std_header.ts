import {Builder} from '@logi/base/ts/common/builder'
import {Impl, Writable} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {buildDcfHeader} from '@logi/src/lib/api/methods'
import {
    AddChildPayloadBuilder,
    Payload,
    RemoveChildPayloadBuilder,
    SetSourcePayloadBuilder,
    SetStandardHeaderPayloadBuilder,
    StdHeaderPayload,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    getNodesVisitor,
    isTable,
    Node,
    NodeType,
    Table,
} from '@logi/src/lib/hierarchy/core'
import {cloneSource, Source, SourceManager} from '@logi/src/lib/source'
import {StandardHeader, UnitEnum} from '@logi/src/lib/template'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly stdHeader: StandardHeader
}

class ActionImpl implements Impl<Action> {
    public stdHeader!: StandardHeader
    public actionType = ActionType.UPDATE_STD_HEADER
    public getPayloads(service: EditorService): readonly StdHeaderPayload[] {
        const payloads: Payload[] = []
        const oldHeader = service.templateSet.standardHeaders
            .find(s => s.name === this.stdHeader.name)
        if (oldHeader === undefined)
            return []
        if (oldHeader.equals(this.stdHeader))
            return []
        const update = new SetStandardHeaderPayloadBuilder()
            .standardHeader(this.stdHeader)
            .build()
        payloads.push(update)
        const tables = preOrderWalk2(
            service.book,
            getNodesVisitor,
            [NodeType.TABLE],
        ).filter(isTable).filter(t => t.referenceHeader === this.stdHeader.name)
        tables.forEach((t: Readonly<Table>): void => {
            payloads.push(...getUpdateTablePayloads(t, this.stdHeader))
            const rate = getRate(oldHeader.unit, this.stdHeader.unit)
            if (rate !== 1)
                payloads.push(...udpateSource(t, rate, service.sourceManager))
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

    public stdHeader(stdHeader: StandardHeader): this {
        this.getImpl().stdHeader = stdHeader
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'stdHeader',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function getUpdateTablePayloads(
    table: Readonly<Table>,
    stdHeader: StandardHeader,
): readonly Payload[] {
    const payloads: Payload[] = []
    table.cols.forEach((n: Readonly<Node>): void => {
        const remove = new RemoveChildPayloadBuilder()
            .uuid(table.uuid)
            .child(n.uuid)
            .build()
        payloads.push(remove)
    })
    const uuidMap = new Map<string, string>()
    const oldCols = preOrderWalk2(
        table,
        getNodesVisitor,
        [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
    )
    oldCols.forEach((n: Readonly<Node>): void => {
        uuidMap.set(removeSuffixE(n.name), n.uuid)
    })
    const newHeader = buildDcfHeader(
        stdHeader.reportDate,
        stdHeader.headerInfos,
    )
    newHeader.tree.forEach((n: Readonly<Node>): void => {
        const add = new AddChildPayloadBuilder()
            .uuid(table.uuid)
            .child(n)
            .build()
        payloads.push(add)
    })
    const newCols = preOrderWalk2(
        newHeader,
        getNodesVisitor,
        [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
    )
    newCols.forEach((n: Readonly<Node>): void => {
        const oldUuid = uuidMap.get(removeSuffixE(n.name))
        if (oldUuid === undefined)
            return
        // tslint:disable-next-line: no-type-assertion
        const writable = n as Writable<Node>
        writable.uuid = oldUuid
    })
    return payloads
}

function removeSuffixE(year: string): string {
    return year.endsWith('E') ? year.slice(0, year.length - 1) : year
}

function getRate(oldUnit: UnitEnum, newUnit: UnitEnum): number {
    const oldRate = unitToNumber(oldUnit)
    const newRate = unitToNumber(newUnit)
    return oldRate / newRate
}

function unitToNumber(unit: UnitEnum): number {
    switch (unit) {
    case UnitEnum.TEN_THOUSAND: return 1
    // tslint:disable-next-line: no-magic-numbers
    case UnitEnum.MILLION: return 100
    // tslint:disable-next-line: no-magic-numbers
    case UnitEnum.HUNDRED_MILLION: return 10000
    default: return 1
    }
}

function udpateSource(
    table: Readonly<Table>,
    rate: number,
    sm: SourceManager,
): readonly Payload[] {
    const payloads: Payload[] = []
    table.getLeafRows().forEach((r: Readonly<Node>): void => {
        table.getLeafCols().forEach((c: Readonly<Node>): void => {
            const oldS = sm.getSource(r.uuid, c.uuid)
            if (oldS === undefined)
                return
            const oldNumber = oldS.value
            if (typeof oldNumber !== 'number')
                return
            // tslint:disable-next-line: no-type-assertion
            const newSource = cloneSource(oldS) as Writable<Source>
            newSource.value = oldNumber * rate
            payloads.push(new SetSourcePayloadBuilder()
                .row(r.uuid)
                .col(c.uuid)
                .source(newSource)
                .build())
        })
    })
    return payloads
}
