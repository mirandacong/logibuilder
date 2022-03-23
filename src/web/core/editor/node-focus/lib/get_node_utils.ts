import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    AnnotationKey,
    FormulaBearer,
    getSubnodes,
    isFormulaBearer,
    isTable,
    Node,
} from '@logi/src/lib/hierarchy/core'
import {
    FocusType,
    NodeFocusInfo,
    NodeFocusInfoBuilder,
} from '@logi/src/web/core/editor/node-focus/define'
export function getFocusInfosUnderTable(
    input: Readonly<FormulaBearer>,
): readonly Readonly<NodeFocusInfo>[] {
    const table = input.getTable()
    if (!isTable(table))
        return []
    const visitor = (
        node: Readonly<Node>,
    ): readonly [readonly Readonly<NodeFocusInfo>[],
        readonly Readonly<Node>[]] => {
        if (node.nodetype !== input.nodetype)
            return [[], getSubnodes(node)]
        if (!isFormulaBearer(node))
            return [[], []]
        const infos: NodeFocusInfo[] = [new NodeFocusInfoBuilder()
            .nodeId(node.uuid)
            .focusType(FocusType.NAME)
            .build()]
        if (node.sliceExprs.length === 0 && node.annotations
            .get(AnnotationKey.LINK_CODE) === undefined)
            infos.push(new NodeFocusInfoBuilder()
                .nodeId(node.uuid)
                .focusType(FocusType.EXPRESSION)
                .build())
        node.sliceExprs.forEach(s => {
            if (s.annotations.get(AnnotationKey.LINK_CODE) !== undefined)
                return
            infos.push(new NodeFocusInfoBuilder()
                .nodeId(node.uuid)
                .focusType(FocusType.EXPRESSION)
                .slice(s)
                .build())
        })
        return [infos, []]
    }
    return preOrderWalk(table, visitor)
}
