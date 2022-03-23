import {Node} from '@logi/src/lib/hierarchy/core'
import {
    DirectiveResponseBuilder,
    DirectiveType,
    DisplayResponse,
    EditorResponseBuilder,
    toOuterText,
} from '@logi/src/lib/intellisense/editor/display'
import {
    ControllerAction,
    ControllerActionType,
} from '@logi/src/lib/intellisense/editor/handlers'

import {Status} from '../status/entry'

export function getActionResponses(
    s: Status,
    action: ControllerAction,
): readonly DisplayResponse[] {
    const type = action.type
    switch (type) {
    case ControllerActionType.COPY:
        if (typeof action.data === 'string')
            return copy(action.data)
        return []
    case ControllerActionType.SAVE:
        return save()
    case ControllerActionType.TRACE:
        if (action.data === undefined || typeof action.data === 'string')
            return []
        return trace(action.data, s, s.location.node)
    case ControllerActionType.CUT:
        if (typeof action.data === 'string')
            return cut(action.data)
        return []
    case ControllerActionType.SKIP_LAST:
        return skipLast()
    case ControllerActionType.SKIP_NEXT:
        return skipNext()
    case ControllerActionType.BLUR:
        return blur()
    case ControllerActionType.SKIP_BACK:
        return skipBack()
    default:
    }
    return []
}

function skipBack(): readonly DisplayResponse[] {
    return [new DirectiveResponseBuilder()
        .directive(DirectiveType.SKIP_BACK)
        .build()]
}

function save(): readonly DisplayResponse[] {
    return [new DirectiveResponseBuilder()
        .directive(DirectiveType.SAVE)
        .build()]
}

function cut(data: string): readonly DisplayResponse[] {
    const directive = new DirectiveResponseBuilder()
        .directive(DirectiveType.CUT)
        .data(data)
        .build()
    return [directive]
}

function trace(
    data: readonly Readonly<Node>[],
    old: Status,
    node: Readonly<Node>,
): readonly DisplayResponse[] {
    const response = new DirectiveResponseBuilder()
        .directive(DirectiveType.TRACE)
        .data(data)
        .build()
    const text = toOuterText(old.textStatus.text, node)
    const txtRes = new EditorResponseBuilder()
        .content(text)
        .endOffset(-1)
        .startOffset(-1)
        .build()
    return [response, txtRes]
}

function copy(data: string): readonly DisplayResponse[] {
    return[new DirectiveResponseBuilder()
        .directive(DirectiveType.COPY)
        .data(data)
        .build()]
}

function skipNext(): readonly DisplayResponse[] {
    return [new DirectiveResponseBuilder()
        .directive(DirectiveType.SKIP_NEXT)
        .build()]
}

function skipLast(): readonly DisplayResponse[] {
    return [new DirectiveResponseBuilder()
        .directive(DirectiveType.SKIP_LAST)
        .build()]
}

function blur(): readonly DisplayResponse[] {
    return [new DirectiveResponseBuilder()
        .directive(DirectiveType.BLUR)
        .build()]
}
