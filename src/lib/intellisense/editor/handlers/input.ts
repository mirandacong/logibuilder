import {EditorInputEvent} from '../events/input'
import {Status, StatusBuilder} from '../status/entry'

import {addPair, addText, isInRef} from './keyboard/base'
import {HandleResult, HandleResultBuilder} from './result'

export class InputEventHandler {
    // tslint:disable-next-line: prefer-function-over-method
    public updateStatus(
        status: Status,
        event: EditorInputEvent,
    ): HandleResult | undefined {
        if (event.isComposing)
            return
        let update = event.data
        if (!isInRef(status.textStatus))
            update = update.normalize('NFKC')
        const convert = convertHalfWidth(update)
        const half = convert.length > 0 ? convert : update
        const pair = PAIR_TOKENS.get(half)
        const txt = pair === undefined
            ? addText(status.textStatus, half)
            : addPair(status, half, pair).newStatus.textStatus
        const newStatus = new StatusBuilder(status).textStatus(txt).build()
        return new HandleResultBuilder()
            .intellisense(true)
            .showFuncUsage(true)
            .newStatus(newStatus)
            .txtPush(true)
            .build()
    }
}

function convertHalfWidth(full: string): string {
    return FULL_TO_HALF.get(full) ?? ''
}

const PAIR_TOKENS = new Map<string, string>([
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
])

const FULL_TO_HALF = new Map<string, string>([
    ['《', '<'],
    ['》', '>'],
    ['。', '.'],
    ['「', ']'],
    ['】', ']'],
    ['【', '['],
])
