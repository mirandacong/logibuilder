import {
    canChangeLevel,
    canMoveSlicesVertically,
    canMoveVertically,
} from '@logi/src/lib/api/common'
import {EditorService} from '@logi/src/lib/api/services'
import {
    isBook,
    isFormulaBearer,
    isNode,
    isRow,
    Node,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'

import {
    canAddCol,
    canAddColBlock,
    canAddRow,
    canAddRowBlock,
    canAddTable,
    canAddTitle,
} from './can_add_node'
import {canEditLabel} from './can_edit_label'
import {canPaste} from './can_paste'

export const enum Type {
    REMOVE_NODE,
    UNDO,
    REDO,
    PASTE,
    ADD_ROW,
    ADD_COL,
    ADD_TABLE,
    ADD_TITLE,
    ADD_ROW_BLOCK,
    ADD_COL_BLOCK,
    EDIT_LABEL,
    MOVE_UP,
    MOVE_DOWN,
    LEVEL_UP,
    LEVEL_DOWN,
    GET_SUM,
    SPLIT_FORECAST,
    GROWTH_RATE,
    RATE_FORECAST,
    LOAD_TEMPLATE,
    PREDICT_BASE_LAST_YEAR,
    PREDICT_BASE_HIST_AVERAGE,
}

// tslint:disable-next-line: cyclomatic-complexity max-func-body-length
export function getEditBarStatus(
    // tslint:disable-next-line: max-params
    focus: readonly Readonly<Node>[],
    type: Type,
    service: EditorService,
    slices?: readonly SliceExpr[],
): boolean {
    switch (type) {
    case Type.REMOVE_NODE:
        return focus.length !== 0
    case Type.UNDO:
        return service.canUndo()
    case Type.REDO:
        return service.canRedo()
    case Type.LEVEL_UP:
        return canChangeLevel(focus, true)
    case Type.LEVEL_DOWN:
        return canChangeLevel(focus, false)
    case Type.EDIT_LABEL:
        return canEditLabel(focus)
    case Type.GET_SUM:
        return focus.filter(isRow).length === focus.length
    case Type.MOVE_UP:
    case Type.MOVE_DOWN:
        if (slices === undefined)
            return canMoveVertically(focus, type === Type.MOVE_UP)
        const fb = focus[0]
        if (!isFormulaBearer(fb))
            return false
        return canMoveSlicesVertically(fb, slices, type === Type.MOVE_UP)
    default:
    }

    if (focus.length !== 1)
        return false
    const node = focus[0]
    switch (type) {
    case Type.ADD_ROW:
        return canAddRow(node)
    case Type.ADD_COL:
        return canAddCol(node)
    case Type.ADD_ROW_BLOCK:
        return canAddRowBlock(node)
    case Type.ADD_COL_BLOCK:
        return canAddColBlock(node)
    case Type.ADD_TABLE:
        return canAddTable(node)
    case Type.ADD_TITLE:
        return canAddTitle(node)
    case Type.LOAD_TEMPLATE:
        return !isBook(node)
    case Type.PASTE:
        const clipboard = service.clipboard
        const nodes = clipboard.nodes
            .map(((u: string): Readonly<Node> | undefined =>
                service.bookMap.get(u)))
            .filter(isNode)
        return canPaste(node, nodes, clipboard.slices)
    case Type.SPLIT_FORECAST:
    case Type.GROWTH_RATE:
    case Type.RATE_FORECAST:
    case Type.PREDICT_BASE_HIST_AVERAGE:
    case Type.PREDICT_BASE_LAST_YEAR:
        return isRow(focus[0])
    default:
    }
    return false
}
