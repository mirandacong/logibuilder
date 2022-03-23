import {KeyboardEventKeyCode} from '@logi/base/ts/common/key_code'
import {StudioApiService} from '@logi/src/web/global/api'

import {
    CTRL_D,
    CTRL_R,
    F2,
    getRedoWithService,
    getUndoWithService,
} from './command'
import {CommandName} from './enum'
import {CommandOp} from './interface'

export function getRegisterOp(): readonly CommandOp[] {
    return [
        {
            alt: false,
            command: CTRL_R,
            ctrl: true,
            key: KeyboardEventKeyCode.KEY_R,
            meta: false,
            name: CommandName.CTRL_R,
            shift: false,
        },
        {
            alt: false,
            command: CTRL_D,
            ctrl: true,
            key: KeyboardEventKeyCode.KEY_D,
            meta: false,
            name: CommandName.CTRL_D,
            shift: false,
        },
        {
            alt: false,
            command: F2,
            ctrl: false,
            key: KeyboardEventKeyCode.F2,
            meta: false,
            name: CommandName.F2,
            shift: false,
        },
    ]
}

export function getRegisterOpWithService(
    service: StudioApiService,
): readonly CommandOp[] {
    return [
        {
            alt: false,
            command: getUndoWithService(service),
            ctrl: true,
            key: KeyboardEventKeyCode.KEY_Z,
            meta: false,
            name: CommandName.CTRL_Z,
            shift: false,
        },
        {
            alt: false,
            command: getRedoWithService(service),
            ctrl: true,
            key: KeyboardEventKeyCode.KEY_Y,
            meta: false,
            name: CommandName.CTRL_Y,
            shift: false,
        },
    ]
}
