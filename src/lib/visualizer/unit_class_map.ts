import {UnitType} from '@logi/src/lib/intellisense'

/**
 * Mapping display units(display in editor conatiner) to css style class.
 */
export function getUnitClass(type: UnitType): string | undefined {
    return UNIT_CLASS_MAP.get(type)
}

const UNIT_CLASS_MAP: Map<UnitType, string> =
    new Map<UnitType, string>([
        [UnitType.UNKNOWN, 't-unknown'],
        [UnitType.BRA, 't-braket'],
        [UnitType.KET, 't-braket'],
        [UnitType.COLON, 't-colon'],
        [UnitType.COMMA, 't-comma'],
        [UnitType.CONSTANT, 't-constant'], // contant number
        [UnitType.DOT, 't-dot'],
        [UnitType.DOUBLE_AMPERSAND, 't-double-amp'],
        [UnitType.DOUBLE_BAR, 't-double-bar'],
        [UnitType.EQ, 't-equal'],
        [UnitType.ERROR, 't-error'],
        [UnitType.IDENTIFIER, 't-identifier'],
        [UnitType.KEY, 't-key'],
        [UnitType.VALUE, 't-value'],
        [UnitType.LABEL_ED, 't-label'],
        [UnitType.LABEL_OP, 't-label'],
        [UnitType.NOT, 't-not'],
        [UnitType.OP, 't-op'],
        [UnitType.REF, 't-ref-expr'],
        [UnitType.REF_EXPR_ED, 't-ref'],
        [UnitType.REF_EXPR_OP, 't-ref'],
        [UnitType.SCALAR_OP, 't-scalar'],
        [UnitType.SELECTOR, 't-selector'],
        [UnitType.SLASH, 't-slash'],
        [UnitType.SQUARE_ED, 't-square'],
        [UnitType.SQUARE_OP, 't-square'],
        [UnitType.TAG, 't-tag'],
        [UnitType.WS_SEQ, 't-ws-seq'],
        [UnitType.FILTER, 't-filter'],
        [UnitType.ELLIPSIS, 't-ellipsis'],
        [UnitType.TRACE_HINT, 't-trace-hint'],
        [UnitType.UNDEFINED_REF, 't-wave-error'],
        [UnitType.SELF, 't-self'],
        [UnitType.THIS_TABLE, 't-this-table'],
        [UnitType.THIS_SHEET, 't-this-sheet'],
        [UnitType.OTHER_SHEET, 't-other-sheet'],
        [UnitType.PATH, 't-path'],
        [UnitType.FUNC_ERROR, 't-func-error'],
        [UnitType.UNEXPECTED_END_ERROR, 't-wave-error'],
        [UnitType.UNRECOGNIZE_ERROR, 't-wave-error'],
        [UnitType.EXPECTED_ERROR, 't-wave-error'],
        [UnitType.MULTI_REF, 't-wave-error'],
    ])
