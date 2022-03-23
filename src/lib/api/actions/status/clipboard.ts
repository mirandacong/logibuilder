import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {ClipBoardPayloadBuilder, Payload} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    FormulaBearer,
    getSubnodes,
    isFormulaBearer,
    isSheet,
    isSliceExpr,
    Node,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'
import {Template} from '@logi/src/lib/template'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly content: readonly string[] | readonly SliceExpr[]
    readonly isCut: boolean
}

class ActionImpl implements Impl<Action> {
    public content!: readonly string[] | readonly SliceExpr[]
    public isCut!: boolean
    public actionType = ActionType.SET_CLIPBOARD
    public getPayloads(service: EditorService): readonly Payload[] {
        const content = getOrderedContent(service, this.content)
        return [new ClipBoardPayloadBuilder()
            .content(content)
            .isCut(this.isCut)
            .build()]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public content(content: readonly string[] | readonly SliceExpr[]): this {
        this.getImpl().content = content
        return this
    }

    public isCut(isCut: boolean): this {
        this.getImpl().isCut = isCut
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'content',
        'isCut',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}

function getOrderedContent(
    service: EditorService,
    content: readonly string[] | readonly SliceExpr[],
): readonly Readonly<Node>[] | readonly SliceExpr[] {
    const allNodes: Readonly<Node>[] = []
    const bookNodes = preOrderWalk(service.book, visitor)
    allNodes.push(...bookNodes)
    service.templateSet.templates.forEach((t: Template): void => {
        const nodes = preOrderWalk(t.node, visitor)
        allNodes.push(...nodes)
    })
    if (!isSlices(content)) {
        const nodesMap = service.bookMap
        const nodes = content
            .map((uuid: string): Readonly<Node> | undefined =>
                nodesMap.get(uuid))
            .filter((n: Readonly<Node> | undefined): n is Node =>
                n !== undefined && !isSheet(n))
        return nodes.sort((a: Readonly<Node>, b: Readonly<Node>): number =>
                allNodes.indexOf(a) - allNodes.indexOf(b))
    }
    const allSlices = allNodes.filter(isFormulaBearer).reduce(
        (res: SliceExpr[], fb: Readonly<FormulaBearer>): SliceExpr[] => {
            res.push(...fb.sliceExprs)
            return res
        },
        [],
    )
    return content.slice().sort((
        a: SliceExpr,
        b: SliceExpr,
    ): number => allSlices.indexOf(a) - allSlices.indexOf(b))

    function visitor(
        node: Readonly<Node>,
    ): [readonly Readonly<Node>[], readonly Readonly<Node>[]] {
        return [[node], getSubnodes(node)]
    }
}

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
function isSlices(array: readonly unknown[]): array is readonly SliceExpr[] {
    return isSliceExpr(array[0])
}
