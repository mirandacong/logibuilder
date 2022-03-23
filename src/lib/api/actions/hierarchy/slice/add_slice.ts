import {Builder} from '@logi/base/ts/common/builder'
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
    isColumn,
    isFormulaBearer,
    isTable,
    Label,
    Node,
    NodeType,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * See payload add_slice for more information.
 * Add slice to target node.
 */
export interface Action extends Base {
    readonly target: string
    readonly position?: number
    /**
     * If this action need to add a `init` slice into the position.
     *
     * There are following situations,
     * 1. The row has slices and addInitSlice is true
     * 2. The row has slices and addInitSlice is false
     * 3. The row has no slice and addInitSlice is true
     * 4. The row has no slice and addInitSlice is false
     *
     * If the situation is 1 or 2, the `addInitSlice` is ignored, if the
     * situation is 3, this action will add an init slice which expression and
     * type are same with the row, and a slice into row, for example
     *      row: expression: {row1} + {row2}, type: CONSTRAINT
     * Add a empty slice, the result of this action will be
     *      [
     *          slice1: expression: {row1} + {row2}, type: CONSTRAINT
     *          slice2: expression:  , type: FX
     *      ]
     *
     * If the situation is 4, the result will add a slice which the expression
     * and type are same with the row, instead of the given slice, in the
     * previous example, the result will be
     *      [
     *          slice1: expression: {row1} + {row2}, type: CONSTRAINT
     *      ]
     */
    readonly addInitSlice: boolean
}

const HIST_NAME = '历史期'
const PROJ_NAME = '预测期'

class ActionImpl implements Action {
    public target!: string
    public position?: number
    public actionType = ActionType.ADD_SLICE

    public addInitSlice = false
    // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
    public getPayloads(service: EditorService): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        const map = service.bookMap
        const node = map.get(this.target)
        if (!isFormulaBearer(node))
            return []
        const slices = node.sliceExprs
        const labels = getColLabels(node)
        const hasHist = labels.includes(HIST_NAME)
        const hasProj = labels.includes(PROJ_NAME)
        if (slices.length > 0) {
            let name = ''
            if (slices.length === 1 && hasHist && hasProj &&
                (slices[0].name === HIST_NAME || slices[0].name === PROJ_NAME))
                name = slices[0].name === HIST_NAME
                    ? PROJ_NAME
                    : HIST_NAME
            const s = new SliceExprBuilder().name(name).build()
            payloads.push(new AddSlicePayloadBuilder()
                .uuid(this.target)
                .position(this.position)
                .slice(s)
                .build())
            const f = new FocusHierarchyPayloadBuilder()
                .uuid(this.target)
                .slice(s)
                .build()
            payloads.push(f)
            return payloads
        }
        payloads.push(new SetExpressionPayloadBuilder()
            .uuid(this.target)
            .expression('')
            .build())
        const annotations = new Map<AnnotationKey, string>()
        const linkCode = node.annotations.get(AnnotationKey.LINK_CODE)
        const linkName = node.annotations.get(AnnotationKey.LINK_NAME)
        if (linkCode !== undefined)
            annotations.set(AnnotationKey.LINK_CODE, linkCode)
        if (linkName !== undefined)
            annotations.set(AnnotationKey.LINK_NAME, linkName)
        // tslint:disable-next-line: no-nested-ternary
        const firstSliceName = hasHist
            ? HIST_NAME
            : hasProj ? PROJ_NAME : ''
        const slice = new SliceExprBuilder()
            .name(firstSliceName)
            .expression(node.expression)
            .annotations(annotations)
            .type(node.type)
            .build()
        payloads.push(new AddSlicePayloadBuilder()
            .uuid(node.uuid)
            .slice(slice)
            .build())
        if (!this.addInitSlice) {
            const focus = new FocusHierarchyPayloadBuilder()
                .uuid(this.target)
                .slice(slice)
                .build()
            payloads.push(focus)
        } else {
            const secondName = firstSliceName === HIST_NAME && hasProj
                ? PROJ_NAME
                : ''
            const s = new SliceExprBuilder().name(secondName).build()
            payloads.push(new AddSlicePayloadBuilder()
                .uuid(this.target)
                .slice(s)
                .build())
            const f = new FocusHierarchyPayloadBuilder()
                .uuid(this.target)
                .slice(s)
                .build()
            payloads.push(f)
        }
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

    public position(position?: number): this {
        this.getImpl().position = position
        return this
    }

    public addInitSlice(addInitSlice: boolean): this {
        this.getImpl().addInitSlice = addInitSlice
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

function getColLabels(node: Readonly<FormulaBearer>): readonly Label[] {
    const table = node.getTable()
    if (!isTable(table))
        return []
    if (isColumn(node))
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
