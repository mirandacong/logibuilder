import {FormulaBearer} from '@logi/src/lib/hierarchy/core'
import {
    FocusType,
    NodeFocusInfo,
    NodeFocusInfoBuilder,
} from '@logi/src/web/core/editor/node-focus/define'

import {getFocusInfosUnderTable} from './get_node_utils'

export function horizontalRightFocus(
    lastFocus: NodeFocusInfo,
    lastFocusFb: Readonly<FormulaBearer>,
): NodeFocusInfo {
    const flatInfos = getFocusInfosUnderTable(lastFocusFb)
        .filter(i => i.nodeId === lastFocus?.nodeId)
    const index = flatInfos.findIndex(i => i.infoEqual(lastFocus))
    if (index === -1)
        return lastFocus
    const next = flatInfos[index + 1]
    const nodeFocus = new NodeFocusInfoBuilder().nodeId(lastFocusFb.uuid)
    /**
     * If next focus node is different with last focus, focus last focus's
     * node name.
     */
    if (next === undefined) {
        nodeFocus.focusType(FocusType.NAME)
        return nodeFocus.build()
    }
    return next
}

export function getVerticalFocusInfo(
    lastFocus: NodeFocusInfo,
    lastFocusFb: Readonly<FormulaBearer>,
    isUp: boolean,
): NodeFocusInfo {
    const flatInfos = getFocusInfosUnderTable(lastFocusFb)
        .filter(i => i.focusType === lastFocus.focusType)
    const currIndex = flatInfos.findIndex(i => i.infoEqual(lastFocus))
    if (currIndex === -1)
        return lastFocus
    if (isUp) {
        if (currIndex === 0)
            return lastFocus
        return flatInfos[currIndex - 1]
    }
    if (currIndex === flatInfos.length - 1)
        return lastFocus
    return flatInfos[currIndex + 1]
}
