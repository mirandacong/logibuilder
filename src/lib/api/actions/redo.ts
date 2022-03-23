import {Builder} from '@logi/base/ts/common/builder'
import {
    HistoryType,
    Payload,
    RedoPayload,
    RedoPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {PluginType} from '@logi/src/lib/api/plugins'
import {EditorService} from '@logi/src/lib/api/services'

import {Action as Base} from './action'
import {ActionType} from './type'

/**
 * Redo action.
 */
// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

// tslint:disable-next-line: no-empty-class
class ActionImpl implements Action {
    public actionType = ActionType.REDO
    // tslint:disable-next-line: prefer-function-over-method
    public getPayloads(service: EditorService): readonly Payload[] {
        if (!service.canRedo())
            return []
        const types = service.getRedoPlugins()
        const result: Payload[] = []
        types.forEach((type: PluginType): void => {
            const payload = buildRedoPayload(type)
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

function buildRedoPayload(type: PluginType): RedoPayload | undefined {
    switch (type) {
    case PluginType.BOOK:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.BOOK).build()
    case PluginType.STD_HEADER:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.TEMPLATE).build()
    case PluginType.SOURCE:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.SOURCE).build()
    case PluginType.MODIFIER:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.MODIFIER).build()
    case PluginType.EXPR:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.EXPR).build()
    case PluginType.HSF:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.HSF).build()
    case PluginType.FOCUS:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.FOCUS).build()
    case PluginType.WORKBOOK:
        return new RedoPayloadBuilder().redoPlugin(HistoryType.WORKBOOK).build()
    default:
    }
    return
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}
