import {Builder} from '@logi/base/ts/common/builder'
import {isException} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    Payload,
    SetFormulaPayloadBuilder,
    SetSourcePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {applyColumnFilter} from '@logi/src/lib/dsl/semantic'
import {
    Column,
    getNodesVisitor,
    isTable,
    NodeType,
    Row,
    SliceExpr,
    Table,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {
    isDatabaseSource,
    ManualSourceBuilder,
    SourceManager,
} from '@logi/src/lib/source'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    /**
     * The uuid of the root.
     */
    readonly root: string
    readonly types: readonly Type[]
}

class ActionImpl implements Impl<Action> {
    public root!: string
    public types: readonly Type[] = []
    public actionType = ActionType.CLEAR_DATA
    public getPayloads(service: EditorService): readonly Payload[] {
        const node = service.bookMap.get(this.root)
        if (node === undefined)
            return []
        const payloads: Payload[] = []
        // tslint:disable-next-line: no-type-assertion
        const rows = preOrderWalk(
            node,
            getNodesVisitor,
            [NodeType.ROW],
        ) as readonly Row[]
        const sm = service.sourceManager
        rows.forEach((r: Readonly<Row>): void => {
            if (r.sliceExprs.length === 0 && !this.types.includes(r.type))
                return
            if (this.types.includes(r.type) && r.sliceExprs.length === 0) {
                payloads.push(...buildEmptyRowPayloads(r, sm))
                return
            }
            r.sliceExprs.forEach((s: SliceExpr): void => {
                if (!this.types.includes(s.type))
                    return
                payloads.push(...buildEmptySlicePayloads(r, s, sm))
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

    public root(root: string): this {
        this.getImpl().root = root
        return this
    }

    public types(types: readonly Type[]): this {
        this.getImpl().types = types
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'root',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function buildEmptyRowPayloads(
    row: Readonly<Row>,
    sourceManager: SourceManager,
): readonly Payload[] {
    // tslint:disable-next-line: no-type-assertion
    const table = row.getTable() as Readonly<Table>
    const cols = table.getLeafCols()
    return getClearPayloads(row, cols, sourceManager)
}

function buildEmptySlicePayloads(
    row: Readonly<Row>,
    sliceExpr: Readonly<SliceExpr>,
    sourceManager: SourceManager,
): readonly Payload[] {
    const table = row.getTable()
    if (!isTable(table))
        return []
    const cols = applyColumnFilter(table.getLeafCols(), sliceExpr.name)
    if (isException(cols))
        return []
    return getClearPayloads(row, cols, sourceManager)
}

function getClearPayloads(
    row: Readonly<Row>,
    cols: readonly Readonly<Column>[],
    sourceManager: SourceManager,
): readonly Payload[] {
    const result: Payload[] = []
    cols.forEach((c: Readonly<Column>): void => {
        const source = sourceManager.getSource(row.uuid, c.uuid)
        if (!isDatabaseSource(source) && source !== undefined) {
            const clearSource = new SetSourcePayloadBuilder()
                .row(row.uuid)
                .col(c.uuid)
                .source(new ManualSourceBuilder().value('').build())
                .build()
            result.push(clearSource)
        }
        const clearCf = new SetFormulaPayloadBuilder()
            .row(row.uuid)
            .col(c.uuid)
            .formula('')
            .build()
        result.push(clearCf)
    })
    return result
}
