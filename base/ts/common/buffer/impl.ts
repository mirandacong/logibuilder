/**
 * Concat the array of Uint8Array.
 *
 * Like 'Buffer.concat' in nodejs.
 */
export function concat(bufs: readonly Uint8Array[]): Uint8Array {
    let length = 0
    bufs.forEach((buf: Uint8Array): void => {
        length += buf.length
    })
    const result = new Uint8Array(length)
    let offset = 0
    bufs.forEach((buf: Uint8Array): void => {
        result.set(buf, offset)
        offset += buf.length
    })
    return result
}

// tslint:disable: no-typeof-undefined
const DECODER = typeof TextDecoder !== 'undefined'
    ? new TextDecoder()
    : undefined

const ENCODER = typeof TextEncoder !== 'undefined'
    ? new TextEncoder()
    : undefined

export function strToUint8Array(text: string): Uint8Array {
    if (ENCODER !== undefined)
        return ENCODER.encode(text)
    return encode(text)
}

function encode(str: string): Uint8Array {
    const buffer = new ArrayBuffer(str.length)
    const bufView = new Uint8Array(buffer)
    for (let i = 0; i < str.length; i += 1)
        bufView[i] = str.charCodeAt(i)
    return bufView
}

export function uint8ArrayToStr(buf: Uint8Array): string {
    if (DECODER !== undefined)
        return DECODER.decode(buf)
    return decode(buf)
}

/**
 * Reference from vscode.
 * TODO (kai): Understand and doc.
 */
// tslint:disable: no-magic-numbers
// tslint:disable: increment-decrement
// tslint:disable-next-line: max-func-body-length
export function decode(buffer: Uint8Array): string {
    const len = buffer.byteLength
    const result: string[] = []
    let offset = 0
    while (offset < len) {
        const v0 = buffer[offset]
        let codePoint: number
        if (v0 >= 0b11110000 && offset + 3 < len)
            /**
             * 4 bytes
             */
            codePoint = (
                (((buffer[offset++] & 0b00000111) << 18) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 12) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 6) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 0) >>> 0)
            )
        else if (v0 >= 0b11100000 && offset + 2 < len)
            /**
             * 3 bytes
             */
            codePoint = (
                (((buffer[offset++] & 0b00001111) << 12) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 6) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 0) >>> 0)
            )
        else if (v0 >= 0b11000000 && offset + 1 < len)
            /**
             * 2 bytes
             */
            codePoint = (
                (((buffer[offset++] & 0b00011111) << 6) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 0) >>> 0)
            )
        else
            /**
             * 1 byte
             */
            codePoint = buffer[offset++]

        if ((codePoint >= 0 && codePoint <= 0xD7FF) ||
            (codePoint >= 0xE000 && codePoint <= 0xFFFF))
            result.push(String.fromCharCode(codePoint))
        else if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
            const uPrime = codePoint - 0x10000
            // tslint:disable: binary-expression-operand-order
            const w1 = 0xD800 + ((uPrime & 0b11111111110000000000) >>> 10)
            const w2 = 0xDC00 + ((uPrime & 0b00000000001111111111) >>> 0)
            result.push(String.fromCharCode(w1))
            result.push(String.fromCharCode(w2))
        } else
        result.push(String.fromCharCode(0xFFFD))
    }
    return result.join('')
}

export function uint8ArrayToString(buffer: Readonly<Uint8Array>): string {
    let binary = ''
    const bufferLength = buffer.byteLength
    for (let i = 0; i < bufferLength; i += 1)
        binary += String.fromCharCode(buffer[i])
    return window.btoa(binary)
}
