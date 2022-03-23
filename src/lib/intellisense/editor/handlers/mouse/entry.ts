import {
    convertInnerOffset,
    toInnerText,
} from '@logi/src/lib/intellisense/editor/display'
import {isCandidate} from '@logi/src/lib/intellisense/suggest/solutions'

import {
    ClickPanelEvent,
    EditorMouseEvent,
    isClickPanelEvent,
} from '../../events/mouse'
import {Status, StatusBuilder} from '../../status/entry'
import {PanelStatusBuilder} from '../../status/panel'
import {TextStatusBuilder} from '../../status/textbox'
import {traceReference} from '../lib'
import {getCandidateText} from '../process'
import {
    ControllerActionBuilder,
    ControllerActionType,
    HandleResult,
    HandleResultBuilder,
} from '../result'

export class MouseEventHandler {
    // tslint:disable-next-line: prefer-function-over-method
    public updateStatus(
        status: Status,
        event: EditorMouseEvent,
    ): HandleResult | undefined {
        if (isClickPanelEvent(event))
            return clickPanel(status, event)
        if (event.leftButton) {
            const outerText = event.editorText
            const text = toInnerText(outerText)
            const start = convertInnerOffset(outerText, event.startOffset)
            const end = convertInnerOffset(outerText, event.endOffset)
            const txtStatus = new TextStatusBuilder(status.textStatus)
                .startOffset(start)
                .endOffset(end)
                .text(text)
                .build()
            const newStatus = new StatusBuilder(status)
                .textStatus(txtStatus)
                .location(event.location)
                .build()
            if (event.ctrlKey && start === end) {
                const nodes = traceReference(text, end, event.location.node)
                if (nodes.length > 0) {
                    const directive = new ControllerActionBuilder()
                        .type(ControllerActionType.TRACE)
                        .data(nodes)
                        .build()
                    return new HandleResultBuilder()
                        .newStatus(newStatus)
                        .directive(directive)
                        .build()
                }
                const t = new TextStatusBuilder(txtStatus)
                    .startOffset(-1)
                    .endOffset(-1)
                    .build()
                const s = new StatusBuilder(newStatus).textStatus(t).build()
                return new HandleResultBuilder().newStatus(s).build()
            }
            return new HandleResultBuilder().newStatus(newStatus).build()
        }
        return
    }
}

function clickPanel(status: Status, event: ClickPanelEvent): HandleResult {
    const id = event.id
    const panelStatus = status.panelStatus
    const unit = panelStatus.getSelectedUnit(id)
    if (unit === undefined)
        return new HandleResultBuilder().newStatus(status).build()
    const entity = unit.entity
    if (isCandidate(entity)) {
        const txt = getCandidateText(entity)
        const s = new StatusBuilder(status).textStatus(txt).build()
        return new HandleResultBuilder().newStatus(s).showPanel(false).build()
    }
    const newPanel = new PanelStatusBuilder(panelStatus).selected(0).build()
    const newStatus = new StatusBuilder(status).panelStatus(newPanel).build()
    return new HandleResultBuilder()
        .newStatus(newStatus)
        .showPanel(true)
        .build()
}
