export interface Payload {
    readonly payloadType: PayloadType
}

/**
 * The enum string is the executing function name for each plugin.
 */
export const enum PayloadType {
    // hierarchy
    ADD_CHILD = 'addChildPayload',
    ADD_LABEL = 'addLabelPayload',
    ADD_SLICE = 'addSlicePayload',
    REMOVE_ANNOTATION = 'removeAnnotationPayload',
    REMOVE_CHILD = 'removeChildPayload',
    REMOVE_LABEL = 'removeLabelPayload',
    REMOVE_SLICE = 'removeSlicePayload',
    REMOVE_SLICE_ANNOTATION = 'removeSliceAnnotationPayload',
    SET_ALIAS = 'setAliasPayload',
    SET_ANNOTATION = 'setAnnotationPayload',
    SET_DATA_TYPE = 'setDataTypePayload',
    SET_EXPRESSION = 'setExpressionPayload',
    SET_HEADER_STUB = 'setHeaderStubPayload',
    SET_NAME = 'setNamePayload',
    SET_REF_HEADER = 'setRefHeaderPayload',
    SET_SLICE_ANNOTATION = 'setSliceAnnotationPayload',
    SET_SLICE_EXPR = 'setSliceExprPayload',
    SET_SLICE_NAME = 'setSliceNamePayload',
    SET_TYPE = 'setTypePayload',
    SET_SLICE_TYPE = 'setSliceTypePayload',
    // dep
    UPDATE_DEP_EXPR = 'updateDepExprPayload',
    UPDATE_RDEP_EXPR = 'updateRdepExprPayload',
    // focus
    FOCUS_HIERARCHY = 'focusHierarchyPayload',
    FOCUS_SOURCE = 'focusSourcePayload',
    // formula
    SET_FORMULA = 'setFormulaPayload',
    // history
    REDO = 'redoPayload',
    UNDO = 'undoPayload',
    // modifier
    SET_BOLD = 'setBoldPayload',
    SET_CURRENCY = 'setCurrencyPayload',
    SET_DECIMAL_PLACES = 'setDecimalPlacesPayload',
    SET_FAMILY = 'setFamilyPayload',
    SET_INDENT = 'setIndentPayload',
    SET_ITALIC = 'setItalicPayload',
    SET_LINE = 'setLinePayload',
    SET_PERCENT = 'setPercentPayload',
    SET_SIZE = 'setSizePayload',
    SET_THOUSANDS_SEPARATOR = 'setThousandsSeparatorPayload',
    SET_MODIFIER = 'setModifierPayload',
    // source
    INIT_PLAYGROUND = 'initPlaygroundPayload',
    LOAD_CUSTOM_SHEETS = 'loadCustomSheetsPayload',
    RESET_CHANGE = 'resetChangePayload',
    SET_IN_PLAYGROUND = 'setSourceInPlayGroundPayload',
    SET_SOURCE = 'setSourcePayload',
    // status
    SET_ACTIVE_SHEET = 'setActiveSheetPayload',
    CLIPBOARD = 'clipBoardPayload',
    DEFAULT_HEADER = 'defaultHeaderPayload',
    // std header
    ADD_TEMPLATE = 'addTemplatePayload',
    REMOVE_STANDARD_HEADER = 'removeStandardHeaderPayload',
    RENAME_STANDARD_HEADER = 'renameStandardHeaderPayload',
    SET_STANDARD_HEADER = 'setStandardHeaderPayload',
    // template
    // editor
    INIT = 'initPayload',
    SET_BOOK = 'setBookPayload',
    SET_FORMULA_MANAGER = 'setFormulaManagerPayload',
    SET_MODIFIER_MANAGER = 'setModifierManagerPayload',
    SET_SOURCE_MANAGER = 'setSourceManagerPayload',
    SET_STD_HEADER_SET = 'setStdHeaderSetPayload',
    BUFFER = 'bufferPayload',
    DOWNLOAD = 'downloadPayload',
    RENDER = 'renderPayload',
    // sheet
    ADD_SHEET = 'addSheetPayload',
    MOVE_SHEET = 'moveSheetPayload',
    REMOVE_SHEET = 'removeSheetPayload',
    RENAME_SHEET = 'renameSheetPayload',
    SPREADSHEET_COMMAND = 'spreadsheetCommandPayload',
    DRY_RUN_COMMAND = 'dryRunCommandPayload',
}
