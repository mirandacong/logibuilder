import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    FormulaBearer,
    getNodesVisitor,
    isBook,
    isColumnBlock,
    isFormulaBearer,
    isRow,
    isRowBlock,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {
    BaseSeekerBuilder,
    EmptyStrategy,
    lcsLenMatch,
    Target,
} from '@logi/src/lib/intellisense/algo'
import {getNodesDist, getRoot} from '@logi/src/lib/intellisense/utils'

export function suggestFbName(
    node: Readonly<FormulaBearer>,
    input: string,
): readonly Target[] {
    if (!isFormulaBearer((node)) && !isRowBlock(node) && !isColumnBlock(node))
        return []
    const book = getRoot(node)
    if (!isBook(book))
        return []
    const expectedType: NodeType[] = []
    if (isRow(node) || isRowBlock(node))
        expectedType.push(...[NodeType.ROW, NodeType.ROW_BLOCK])
    else
        expectedType.push(...[NodeType.COLUMN, NodeType.COLUMN_BLOCK])
    const candidateNodes = preOrderWalk(book, getNodesVisitor, expectedType)
    const sorted = [...candidateNodes]
        .sort((
            a: Readonly<Node>,
            b: Readonly<Node>,
        ): number => getNodesDist(a, node) - getNodesDist(b, node))
        .filter((n: Readonly<Node>): boolean => n !== node)
    const seeker = new BaseSeekerBuilder()
        .caseSensitive(false)
        .data(sorted.map((n: Readonly<Node>): string => n.name))
        .executor(lcsLenMatch)
        .emptyStrategy(EmptyStrategy.EMPTY)
        .build()
    return seeker.seek(input)
}
