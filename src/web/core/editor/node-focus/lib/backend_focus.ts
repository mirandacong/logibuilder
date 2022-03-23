import {ActionType, FocusResult} from '@logi/src/lib/api'
import {
    FocusType,
    NodeFocusInfo,
    NodeFocusInfoBuilder,
} from '@logi/src/web/core/editor/node-focus/define'

export function getSelInfos(
    result: FocusResult,
): readonly Readonly<NodeFocusInfo>[] {
    const infos: Readonly<NodeFocusInfo>[] = []
    const ignoreAction: number[] = [
        ActionType.SET_EXPRESSION,
        ActionType.SET_EXPR_SLICE,
        ActionType.SET_NAME,
        ActionType.SET_NAME_SLICE,
    ]
    result.hierarchy.forEach(focus => {
        if (ignoreAction.includes(result.actionType))
            return
        infos.push(new NodeFocusInfoBuilder()
            .nodeId(focus.uuid)
            .slice(focus.slice)
            .build())
    })
    return infos
}

export function getFocusInfo(
    result: FocusResult,
): Readonly<NodeFocusInfo> | undefined {
    const focusAction: number[] = [
        ActionType.ADD_CHILD,
        ActionType.ADD_SLICE,
        ActionType.BATCH_ADD_SLICES,
        ActionType.ADD_SEPARATOR,
    ]
    let info: Readonly<NodeFocusInfo> | undefined
    result.hierarchy.forEach(focus => {
        if (!focusAction.includes(result.actionType))
            return
        info = new NodeFocusInfoBuilder()
            .nodeId(focus.uuid)
            .slice(focus.slice)
            .focusType(FocusType.NAME)
            .build()
    })
    return info
}
