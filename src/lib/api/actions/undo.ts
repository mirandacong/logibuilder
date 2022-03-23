import {Builder} from '@logi/base/ts/common/builder'
import {
    HistoryType,
    Payload,
    UndoPayload,
    UndoPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {PluginType} from '@logi/src/lib/api/plugins'
import {EditorService} from '@logi/src/lib/api/services'

import {Action as Base} from './action'
import {ActionType} from './type'

/**
 * Undo action.
 */
// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

// tslint:disable-next-line: no-empty-class
class ActionImpl implements Action {
    public actionType = ActionType.UNDO
    // tslint:disable-next-line: prefer-function-over-method
    public getPayloads(service: EditorService): readonly Payload[] {
        if (!service.canUndo())
            return []
        const types = service.getUndoPlugins()
        const result: Payload[] = []
        types.forEach((type: PluginType): void => {
            const payload = buildUndoPayload(type)
            if (payload !== undefined)
                result.push(payload)
        })
        return result
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

function buildUndoPayload(type: PluginType): UndoPayload | undefined {
    switch (type) {
    case PluginType.BOOK:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.BOOK).build()
    case PluginType.STD_HEADER:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.TEMPLATE).build()
    case PluginType.SOURCE:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.SOURCE).build()
    case PluginType.MODIFIER:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.MODIFIER).build()
    case PluginType.EXPR:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.EXPR).build()
    case PluginType.HSF:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.HSF).build()
    case PluginType.FOCUS:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.FOCUS).build()
    case PluginType.WORKBOOK:
        return new UndoPayloadBuilder().undoPlugin(HistoryType.WORKBOOK).build()
    default:
    }
    return
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}
