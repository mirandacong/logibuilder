import {Node} from '@logi/src/lib/hierarchy/core'
import {
    convertOuterOffset,
    EditorResponse,
    EditorResponseBuilder,
    toOuterText,
} from '@logi/src/lib/intellisense/editor/display'

import {TextStatus} from '../status/textbox'
export function getEditorResponse(
    status: TextStatus,
    loc: Readonly<Node>,
): Readonly<EditorResponse> {
    const text = toOuterText(status.text, loc)
    return new EditorResponseBuilder()
        .content(text)
        .endOffset(convertOuterOffset(status.text, status.endOffset))
        .startOffset(convertOuterOffset(status.text, status.startOffset))
        .build()
}
