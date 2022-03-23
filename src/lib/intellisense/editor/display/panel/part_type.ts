import {NodeType} from '@logi/src/lib/hierarchy/core'

/**
 * Indicate the display type of a panel item unit.
 */
export const enum ViewType {
    UNKNOWN,
    BOOK,
    SHEET,
    TITLE,
    TABLE,
    ROW_BLOCK,
    COLUMN_BLOCK,
    ROW,
    COLUMN,
    SLICE,
    LABEL,
    PATH,
    FUNCTION,
    DICT,
    ANNOTATION,
    KEYWORD,
}

export function getViewType(nodeType: NodeType): ViewType {
    return NODETYPE_MAP.get(nodeType) ?? ViewType.UNKNOWN
}

const NODETYPE_MAP = new Map<NodeType, ViewType>([
    [NodeType.TYPE_UNSPECIFIED, ViewType.UNKNOWN],
    [NodeType.BOOK, ViewType.BOOK],
    [NodeType.SHEET, ViewType.SHEET],
    [NodeType.TITLE, ViewType.TITLE],
    [NodeType.TABLE, ViewType.TABLE],
    [NodeType.ROW_BLOCK, ViewType.ROW_BLOCK],
    [NodeType.COLUMN_BLOCK, ViewType.COLUMN_BLOCK],
    [NodeType.ROW, ViewType.ROW],
    [NodeType.COLUMN, ViewType.COLUMN],
])
