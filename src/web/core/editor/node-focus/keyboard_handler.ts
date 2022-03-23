import {KeyboardEventCode} from '@logi/base/ts/common/key_code'

export function keyboradCtrlEvent(e: KeyboardEvent): void {
    if (!e.ctrlKey)
        return
    const stopPropagation: readonly string[] = [
        KeyboardEventCode.KEY_C,
        KeyboardEventCode.KEY_V,
        KeyboardEventCode.KEY_X,
    ]
    if (stopPropagation.includes(e.code))
        e.stopPropagation()
}

export function keyboradAltEvent(e: KeyboardEvent): void {
    if (!e.altKey)
        return
    const stopPropagation: readonly string[] = [
        KeyboardEventCode.KEY_S,
    ]
    if (stopPropagation.includes(e.code))
        e.stopPropagation()
}
