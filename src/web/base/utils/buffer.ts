import {
    strToUint8Array as strToUint8,
    uint8ArrayToStr as Uint8Tostr,
} from '@logi/base/ts/common/buffer'

export function strToUint8Array(text: string): Uint8Array {
    return strToUint8(text)
}

export function uint8ArrayToStr(buf: Uint8Array): string {
    return Uint8Tostr(buf)
}
