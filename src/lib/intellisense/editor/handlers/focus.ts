import {toInnerText} from '../display/convert'
import {EditorDisplayUnit} from '../display/textbox/unit'
import {UnitType} from '../display/textbox/unit_type'
import {EditorFocusEvent} from '../events/focus'
import {Status, StatusBuilder} from '../status/entry'
import {TextStatusBuilder} from '../status/textbox'

import {getBlurDisplay} from './lib'
import {HandleResult, HandleResultBuilder} from './result'

export class FocusEventHandler {
    // tslint:disable-next-line: prefer-function-over-method
    public updateStatus(status: Status, event: EditorFocusEvent): HandleResult {
        if (!event.isBlur) {
            const innerTxt = toInnerText(event.editorText)
            const t = new TextStatusBuilder()
                .startOffset(0)
                .endOffset(0)
                .text(innerTxt)
                .build()
            const s = new StatusBuilder()
                .location(event.location)
                .textStatus(t)
                .build()
            return new HandleResultBuilder().newStatus(s).build()
        }
        if (isOutsideBlur(status.textStatus.text))
            return new HandleResultBuilder()
                .newStatus(status)
                .intellisense(false)
                .showPanel(false)
                .build()
        const displayTxt = getBlurDisplay(event.editorText)
        const newTxt = new TextStatusBuilder()
            .text(displayTxt)
            .endOffset(-1)
            .startOffset(-1)
            .build()
        const newStatus = new StatusBuilder(status).textStatus(newTxt).build()
        return new HandleResultBuilder()
            .newStatus(newStatus)
            .intellisense(false)
            .showPanel(false)
            .build()
    }
}

/**
 * There are 2 types of blur event. We call inside blur and outside blur.
 * Inside blur means the cursor was originally in the textbox like this.
 *    +-------------+
 *    | textbox     |
 *    +-------^-----+  ^
 *            +        +
 *         cursor      blur place
 * Outside blur means mouse down outside and cross the textbox before mouse up.
 * This action will cause blur envent which is out of our expectations.
 */
function isOutsideBlur(text: readonly (string | EditorDisplayUnit)[]): boolean {
    for (const element of text) {
        if (typeof element === 'string')
            continue
        if (element.tags.includes(UnitType.READ_BUFFER))
            return true
    }
    return false
}
