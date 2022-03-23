import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Event, EventType} from './base'

/**
 * Indicate the event that input a full-width character.
 * This is a simplified edition of `InputEvent` in browser. We use this event
 * mainly to deal with the full-width characters like `。`.
 *
 * For detail:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event
 */
export interface EditorInputEvent extends Event {
    readonly data: string
    /**
     * If this event happens in a composition process.
     * If true, it means this EditorInputEvent should be ignored since there
     * must be a company EditorCompositionEvent handled.
     */
    readonly isComposing: boolean
    /**
     * Type of this input event.
     */
    readonly inputType: InputType
}

class EditorInputEventImpl implements Impl<EditorInputEvent> {
    public data!: string
    public isComposing!: boolean
    public inputType!: InputType
    public eventType = EventType.INPUT
}

export class EditorInputEventBuilder extends
    Builder<EditorInputEvent, EditorInputEventImpl> {
    public constructor(obj?: Readonly<EditorInputEvent>) {
        const impl = new EditorInputEventImpl()
        if (obj)
            EditorInputEventBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public data(data: string): this {
        this.getImpl().data = data
        return this
    }

    public isComposing(isComposing: boolean): this {
        this.getImpl().isComposing = isComposing
        return this
    }

    public inputType(inputType: InputType): this {
        this.getImpl().inputType = inputType
        return this
    }

    protected get daa(): readonly string[] {
        return EditorInputEventBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = []
}

export function isEditorInputEvent(obj: object): obj is EditorInputEvent {
    return obj instanceof EditorInputEventImpl
}

export const enum InputType {
    INSERT_TEXT = 'insertText',
    INSERT_REPLACEMENT_TEXT= 'insertReplacementText',
    INSERT_LINE_BREAK= 'insertLineBreak',
    INSERT_PARAGRAPH= 'insertParagraph',
    INSERT_ORDERED_LIST= 'insertOrderedList',
    INSERT_UNORDERED_LIST= 'insertUnorderedList',
    INSERT_HORIZONTAL_RULE= 'insertHorizontalRule',
    INSERT_FROM_YANK= 'insertFromYank',
    INSERT_FROM_DROP= 'insertFromDrop',
    INSERT_FROM_PASTE= 'insertFromPaste',
    INSERT_TRANSPOSE= 'insertTranspose',
    INSERT_COMPOSITION_TEXT= 'insertCompositionText',
    INSERT_FROM_COMPOSITION= 'insertFromComposition',
    INSERT_LINK= 'insertLink',
    DELETE_BY_COMPOSITION = 'deleteByComposition',
    DELETE_COMPOSITION_TEXT = 'deleteCompositionText',
    DELETE_WORD_BACKWARD = 'deleteWordBackward',
    DELETE_WORD_FORWARD = 'deleteWordForward',
    DELETE_SOFT_LINE_BACKWARD = 'deleteSoftLineBackward',
    DELETE_SOFT_LINE_FORWARD = 'deleteSoftLineForward',
    DELETE_ENTIRE_SOFTLINE = 'deleteEntireSoftLine',
    DELETE_HARD_LINE_BACKWARD = 'deleteHardLineBackward',
    DELETE_HARD_LINE_FORWARD = 'deleteHardLineForward',
    DELETE_BY_DRAG = 'deleteByDrag',
    DELETE_BY_CUT = 'deleteByCut',
    DELETE_BY_CONTENT = 'deleteByContent',
    DELETE_CONTENT_BACKWARD = 'deleteContentBackward',
    DELETE_CONTENT_FORWARD = 'deleteContentForward',
    HISTORY_UNDO= 'historyUndo',
    HISTORY_REDO= 'historyRedo',
    FORMAT_BOLD = 'formatBold',
    FORMAT_ITALIC = 'formatItalic',
    FORMAT_UNDERLINE = 'formatUnderline',
    FORMAT_STRIKETHROUGH = 'formatStrikethrough',
    FORMAT_SUPERSCRIPT = 'formatSuperscript',
    FORMAT_SUBSCRIPT = 'formatSubscript',
    FORMAT_JUSTIFY_FULL = 'formatJustifyFull',
    FORMAT_JUSTIFY_CENTER = 'formatJustifyCenter',
    FORMAT_JUSTIFY_RIGHT = 'formatJustifyRight',
    FORMAT_JUSTIFY_LEFT = 'formatJustifyLeft',
    FORMAT_INDENT = 'formatIndent',
    FORMAT_OUTDENT = 'formatOutdent',
    FORMAT_REMOVE = 'formatRemove',
    FORMAT_SET_BLOCK_TEXT_DIRECTION = 'formatSetBlockTextDirection',
    FORMAT_SET_INLINE_TEXT_DIRECTION = 'formatSetInlineTextDirection',
    FORMAT_BACK_COLOR = 'formatBackColor',
    FORMAT_FONT_COLOR = 'formatFontColor',
    FORMAT_FONT_NAME = 'formatFontName',
}
