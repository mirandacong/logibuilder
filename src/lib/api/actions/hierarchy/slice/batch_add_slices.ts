import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    AddSlicePayloadBuilder,
    FocusHierarchyPayloadBuilder,
    HierarchyPayload,
    SetExpressionPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    AnnotationKey,
    FormulaBearer,
    getNodesVisitor,
    isFormulaBearer,
    isTable,
    Label,
    Node,
    NodeType,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

const HIST_NAME = '历史期'
const PROJ_NAME = '预测期'

export interface Action extends Base {
    readonly targets: readonly string[]
}

class ActionImpl implements Impl<Action> {
    public targets: readonly string[] = []
    public actionType = ActionType.BATCH_ADD_SLICES

    // tslint:disable-next-line: max-func-body-length
    public getPayloads(service: EditorService): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        const map = service.bookMap
        const fbs = this.targets
            .map((uuid: string): Readonly<Node> | undefined => map.get(uuid))
            .filter(isFormulaBearer)
        // tslint:disable-next-line: max-func-body-length
        fbs.forEach((fb: Readonly<FormulaBearer>): void => {
            const labels = getColLabels(fb)
            const hasHist = labels.includes(HIST_NAME)
            const hasProj = labels.includes(PROJ_NAME)
            if (fb.sliceExprs.length > 0) {
                const slices = fb.sliceExprs
                let name = ''
                if (slices.length === 1 && hasHist && hasProj) {
                    if (slices[0].name === HIST_NAME)
                // tslint:disable-next-line: limit-indent-for-method-in-class
                        name = PROJ_NAME
                    if (slices[0].name === PROJ_NAME)
                // tslint:disable-next-line: limit-indent-for-method-in-class
                        name = HIST_NAME
                }
                const s = new SliceExprBuilder().name(name).build()
                payloads.push(new AddSlicePayloadBuilder()
                    .uuid(fb.uuid)
                    .slice(s)
                    .build())
                return
            }
            const annotations = new Map<AnnotationKey, string>()
            const linkCode = fb.annotations.get(AnnotationKey.LINK_CODE)
            const linkName = fb.annotations.get(AnnotationKey.LINK_NAME)
            if (linkCode !== undefined)
                annotations.set(AnnotationKey.LINK_CODE, linkCode)
            if (linkName !== undefined)
                annotations.set(AnnotationKey.LINK_NAME, linkName)
            payloads.push(new SetExpressionPayloadBuilder()
                .uuid(fb.uuid)
                .expression('')
                .build())
            let sliceName = ''
            if (hasHist)
                sliceName = HIST_NAME
            else if (hasProj)
                sliceName = PROJ_NAME
            const slice = new SliceExprBuilder()
                .name(sliceName)
                .expression(fb.expression)
                .annotations(annotations)
                .type(fb.type)
                .build()
            payloads.push(new AddSlicePayloadBuilder()
                .uuid(fb.uuid)
                .slice(slice)
                .build())
            payloads.push(new FocusHierarchyPayloadBuilder()
                .uuid(fb.uuid)
                .slice(slice)
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

    public targets(targets: readonly string[]): this {
        this.getImpl().targets = targets
        return this
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function getColLabels(node: Readonly<FormulaBearer>): readonly Label[] {
    const table = node.getTable()
    if (!isTable(table))
        return []
    const labels: Label[] = []
    const cols = preOrderWalk(
        table,
        getNodesVisitor,
        [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
    )
    cols.forEach((c: Readonly<Node>): void => {
        labels.push(...c.labels)
    })
    return labels
}
