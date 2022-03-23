import {ErrorType, RefTokenType, TokenType} from '@logi/src/lib/dsl/lexer/v2'

/**
 * Used to indicate the type of the unit in the textbox.
 */
export const enum UnitType {
    UNKNOWN = 'unknown',
    // TokenType
    BRA = 'bra',                               // (
    COLON = 'colon',                           // :
    COMMA = 'comma',                           // ,
    CONSTANT = 'constant',
    DOT = 'dot',                               // .
    DOUBLE_AMPERSAND = 'double_ampersand',     // &&
    DOUBLE_BAR = 'double_bar',                 // ||
    EQ = 'eq',                                 // =
    ERROR = 'error',
    IDENTIFIER = 'identifier',
    KET = 'ket',                               // )
    KEY = 'key',
    LABEL_ED = 'label_ed',                    // ]]
    LABEL_OP = 'label_op',                    // [[
    NOT = 'not',                              // !
    OP = 'op',                                // + - * /
    REF = 'ref',
    REF_EXPR_ED = 'ref_expr_ed',              // }
    REF_EXPR_OP = 'ref_expr_op',              // {
    SCALAR_OP = 'scalar_op',                  // @
    SELECTOR = 'selector',
    SLASH = 'slash',                         // /
    SQUARE_ED = 'square_ed',                 // ]
    SQUARE_OP = 'square_op',                 // [
    TAG = 'tag',
    VALUE = 'value',
    WS_SEQ = 'ws_seq',
    // Hierarchy NodeType
    PATH = 'path',
    BOOK = 'book',
    SHEET = 'sheet',
    TITLE = 'title',
    TABLE = 'table',
    ROW_BLOCK = 'row_block',
    COLUMN_BLOCK = 'column_block',
    ROW = 'row',
    COLUMN = 'column',
    ROW_SELECTION = 'row_selection',
    COLUMN_SELECTION = 'column_selection',
    // Display
    FILTER = 'filter',
    ELLIPSIS = 'ellipsis',                     // ...

    UNDEFINED_REF = 'undefined_ref',
    MULTI_REF = 'multi ref',
    // Referred from the same formula bearer.
    SELF = 'self',
    // Referred from the same table.
    THIS_TABLE = 'this_table',
    // Referred from the same sheet but not the same table.
    THIS_SHEET = 'this_sheet',
    // Referred from other sheet.
    OTHER_SHEET = 'other_sheet',
    // @%d@
    ALIAS = 'alias',
    PREVIEW = 'preview',
    // Indicate that this unit has a target node to trace to.
    TRACE_HINT = 'trace_hint',
    // A special type indicating this unit has buffer to be read.
    READ_BUFFER = 'read_buffer',
    FUNC_ERROR = 'func_error',
    UNRECOGNIZE_ERROR = 'unrecorgnized_error',
    UNEXPECTED_END_ERROR = 'unexpected_end_error',
    EXPECTED_ERROR = 'expected_error',
}

export function getUnitType(type: TokenType): UnitType {
    const result = TOKEN_MAP.get(type)
    return result ?? UnitType.UNKNOWN
}

export function getRefUnitType(type: RefTokenType): UnitType {
    const result = REF_TOKEN_MAP.get(type)
    return result ?? UnitType.UNKNOWN
}

export function getErrorUnitType(errType: ErrorType): UnitType {
    const result = ERROR_MAP.get(errType)
    return result ?? UnitType.UNKNOWN
}

const TOKEN_MAP: Map<TokenType, UnitType> =
    new Map<TokenType, UnitType>([
    [TokenType.BRA, UnitType.BRA],
    [TokenType.COMMA, UnitType.COMMA],
    [TokenType.REF, UnitType.REF],
    [TokenType.CONSTANT, UnitType.CONSTANT],
    [TokenType.DATE, UnitType.CONSTANT],
    [TokenType.KEYWORD, UnitType.KEY],
    [TokenType.ERROR, UnitType.ERROR],
    [TokenType.FUNC, UnitType.IDENTIFIER],
    [TokenType.METHOD, UnitType.IDENTIFIER],
    [TokenType.KET, UnitType.KET],
    [TokenType.OP, UnitType.OP],
    [TokenType.WS, UnitType.WS_SEQ],
    [TokenType.SLICE, UnitType.SELECTOR],
    ])

const REF_TOKEN_MAP = new Map<RefTokenType, UnitType>([
    [RefTokenType.KEYWORD, UnitType.KEY],
    [RefTokenType.LABEL_SPLITTER, UnitType.SLASH],
    [RefTokenType.LABEL_START, UnitType.LABEL_OP],
    [RefTokenType.LABEL_END, UnitType.LABEL_ED],
    [RefTokenType.LABEL, UnitType.SELECTOR],
    [RefTokenType.PART, UnitType.PATH],
    [RefTokenType.SPLITTER, UnitType.PATH],
    [RefTokenType.WS, UnitType.WS_SEQ],
    [RefTokenType.REF_START, UnitType.REF_EXPR_OP],
    [RefTokenType.REF_END, UnitType.REF_EXPR_ED],
    [RefTokenType.ALIAS, UnitType.ALIAS],
])

const ERROR_MAP = new Map<ErrorType, UnitType>([
    [ErrorType.EXPECTED, UnitType.EXPECTED_ERROR],
    [ErrorType.UNEXPECTED_END, UnitType.UNEXPECTED_END_ERROR],
    [ErrorType.UNRECORGNIZED, UnitType.UNRECOGNIZE_ERROR],
])
