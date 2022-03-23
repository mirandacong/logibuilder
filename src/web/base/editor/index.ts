// tslint:disable-next-line: limit-for-build-index
export {
    getCaretOffsetInPx,
    getCharOffset,
    getElementRange,
    setElementRange,
    setRange,
} from './cursor'
export {
    Selection,
    SelectionBuilder,
    isSelection,
    assertIsSelection,
    ElementRange as EditorRange,
    ElementRangeBuilder as EditorRangeBuilder,
    assertIsElementRange,
    isElementRange,
} from './range'
export {ElementRange, ElementRangeBuilder} from './element_range'
export {replaceNbsp} from './nbsp'
export {getSquigglySVGData, addEditorGlobalStyle} from './widget'
export {pastePlainText} from './clipboard_utils'
export {getOptionScrollPosition} from './get_scroll_position'
