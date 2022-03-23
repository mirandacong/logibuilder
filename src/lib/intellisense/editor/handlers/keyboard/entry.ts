import {KeyboardEventCode, KEY_CODE_MAP} from '@logi/base/ts/common/key_code'
import {
    CompositionType,
    EditorCompositonEvent,
    EditorKeyboardEvent,
    EditorKeyboardEventBuilder,
    isCtrlKeyvEvent,
    isEditorCompositonEvent,
} from '@logi/src/lib/intellisense/editor/events'

import {Status, StatusBuilder} from '../../status/entry'
import {TextStatusBuilder} from '../../status/textbox'
import {Action, HandleResult, HandleResultBuilder} from '../result'

import {addText, isInRef} from './base'
import {getIgnoreKeys, getKeybindings} from './bindings'

export class KeyboardEventHandler {
    public constructor() {
        this._init()
    }
    // tslint:disable-next-line: max-func-body-length
    public updateStatus(
        status: Status,
        event: EditorKeyboardEvent | EditorCompositonEvent,
    ): HandleResult | undefined {
        if (isEditorCompositonEvent(event)) {
            if (event.type === CompositionType.UPDATE)
                return
            if (event.type === CompositionType.START) {
                const t = new TextStatusBuilder(status.textStatus)
                    .ime(true)
                    .build()
                return new HandleResultBuilder()
                    .newStatus(new StatusBuilder(status).textStatus(t).build())
                    .build()
            }
            const txt = new TextStatusBuilder(status.textStatus)
                .ime(false)
                .build()
            let str = event.data
            if (!isInRef(txt))
                str = str.normalize('NFKC')
            const newTxt = addText(txt, str)
            const s = new StatusBuilder(status).textStatus(newTxt).build()
            return new HandleResultBuilder()
                .newStatus(s)
                .intellisense(event.data.length > 0)
                .showPanel(false)
                .txtPush(true)
                .build()
        }
        /**
         * IME
         */
        if (status.textStatus.ime
            || event.key === 'Process'
            || event.key === 'Unidentified')
            return
        const action = this._get(event)
        if (action !== undefined) {
            if (isCtrlKeyvEvent(event))
                return action(status, event.paste)
            return action(status)
        }
        if (event.key === undefined)
            return
        if (this._ignoreKeys .includes(event.code)
            || event.ctrlKey
            || event.metaKey)
            return
        const newTxtStatus = addText(status.textStatus, event.key)
        const newStatus = new StatusBuilder(status)
            .textStatus(newTxtStatus)
            .build()
        return new HandleResultBuilder()
            .newStatus(newStatus)
            .intellisense(true)
            .showFuncUsage(true)
            .txtPush(true)
            .build()
    }

    // tslint:disable-next-line: readonly-array
    private _factory: (readonly [EditorKeyboardEvent, Action])[] = []

    private _ignoreKeys = getIgnoreKeys()

    private _init(): void {
        getKeybindings().forEach((value: (readonly [string, Action])): void => {
            this._register(value[0], value[1])
        })
        getIgnoreKeys().forEach((value: string): void => {
            this._register(value, (curr: Status):
                HandleResult => new HandleResultBuilder()
                    .intellisense(false)
                    .newStatus(curr)
                    .build())
        })
    }

    private _get(event: EditorKeyboardEvent): Action | undefined {
        for (const item of this._factory)
            if (event.typeEqual(item[0]))
                return item[1]
        return
    }

    private _register(typings: string, action: Action): void {
        const groups = typings.split('|').map((s: string): string => s.trim())
        groups.forEach((t: string): void => {
            const event = buildKeyEvent(t)
            this._factory.push([event, action])
        })
    }
}

/**
 * According to the string to build key event for convenient sake.
 *
 * NOTE: Export this function only for test.
 */
export function buildKeyEvent(typings: string): EditorKeyboardEvent {
    const keys = typings.split('+').map((s: string): string => s.trim())
    const builder = new EditorKeyboardEventBuilder()
    keys.forEach((key: string): void => {
        if (key === 'Ctrl')
            builder.ctrlKey(true)
        else if (key === 'Shift')
            builder.shiftKey(true)
        else if (key === 'Alt')
            builder.altKey(true)
        else if (key === 'Meta')
            builder.metaKey(true)
        else if (KEY_CODE_MAP.has(key))
            builder.code(KEY_CODE_MAP.get(key) as KeyboardEventCode)
        return
    })
    return builder.build()
}
