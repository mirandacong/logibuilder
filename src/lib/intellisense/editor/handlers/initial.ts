import {EditorInitialEvent} from '@logi/src/lib/intellisense/editor/events'

import {toOuterText} from '../display/convert'
import {StatusBuilder} from '../status/entry'
import {TextStatusBuilder} from '../status/textbox'

import {getBlurDisplay} from './lib'
import {HandleResult, HandleResultBuilder} from './result'

export function initDisplay(event: EditorInitialEvent): HandleResult {
    const expr = event.expression
    const outer = toOuterText(expr.split(''), event.loc.node)
    const txt = getBlurDisplay(outer)
    const txtStatus = new TextStatusBuilder()
        .text(txt)
        .startOffset(-1)
        .endOffset(-1)
        .build()
    const s = new StatusBuilder()
        .textStatus(txtStatus)
        .location(event.loc)
        .build()
    return new HandleResultBuilder()
        .intellisense(false)
        .newStatus(s)
        .showPanel(false)
        .build()
}
