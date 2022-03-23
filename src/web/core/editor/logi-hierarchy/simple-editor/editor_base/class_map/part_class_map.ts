import {ViewType} from '@logi/src/lib/intellisense'

/**
 * Mapping view part(display in panel item) to css style class.
 */
export function getViewPartClass(viewType: ViewType): string | undefined {
    return VIEW_PART_CLASS_MAP.get(viewType)
}

const VIEW_PART_CLASS_MAP = new Map<ViewType, string>([
    [ViewType.UNKNOWN, 'vp-unknown'],
    [ViewType.BOOK, 'vp-book'],
    [ViewType.SHEET, 'vp-sheet'],
    [ViewType.TITLE, 'vp-title'],
    [ViewType.TABLE, 'vp-table'],
    [ViewType.ROW_BLOCK, 'vp-rowb'],
    [ViewType.COLUMN_BLOCK, 'vp-colb'],
    [ViewType.ROW, 'vp-row'],
    [ViewType.COLUMN, 'vp-col'],
    [ViewType.SLICE, 'vp-rows'],
    [ViewType.SLICE, 'vp-cols'],
    [ViewType.FUNCTION, 'vp-func'],
    [ViewType.DICT, 'vp-dict'],
])
