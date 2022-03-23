import {fromEvent, Observable} from 'rxjs'
import {map, take} from 'rxjs/operators'
const BASE64_MARKER = ';base64,'

export function readFile(file: File): Observable<ArrayBuffer | undefined> {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    return fromEvent<ProgressEvent>(reader, 'load').pipe(
        map((event: ProgressEvent): ArrayBuffer | undefined => {
            if (event.target === null)
                return
            // tslint:disable-next-line: no-type-assertion
            const ab = (event.target as FileReader).result
            if (ab === null || typeof ab === 'string')
                return
            return ab
        }),
        take(1),
    )
}

export function readFileToDataUrl(file: File): Observable<string | undefined> {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    return fromEvent<ProgressEvent>(reader, 'load').pipe(
        map((event: ProgressEvent): string | undefined => {
            if (event.target === null)
                return
            // tslint:disable-next-line: no-type-assertion
            const dataUrl = (event.target as FileReader).result
            if (dataUrl === null || typeof dataUrl !== 'string')
                return
            return dataUrl
        }),
        take(1),
    )
}

/**
 * @param dataUrl data:[mediatype];base64, [base64]
 * @returns base64
 */
export function dataUrlToBase64(dataUrl: string): string{
    const index = dataUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length
    return dataUrl.substring(index)
}

export function readFileToBase64(file: File): Observable<string | undefined> {
    return readFileToDataUrl(file).pipe(map(result => {
        if (result === undefined)
            return
        return dataUrlToBase64(result)
    }))
}

/**
 * https://gist.github.com/borismus/1032746
 */
export function getUint8arrayFromBase64(dataUrl: string): Uint8Array {
    let index = dataUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length
    if (!dataUrl.includes(BASE64_MARKER))
        index = 0
    const base64 = dataUrl.substring(index)
    const raw = window.atob(base64)
    const rawLength = raw.length
    const bytes = new Uint8Array(new ArrayBuffer(rawLength))
    for (let i = 0; i < rawLength; i += 1)
        bytes[i] = raw.charCodeAt(i)
    return bytes
}

export function uint8ArrayToString(buffer: Readonly<Uint8Array>): string {
    let binary = ''
    const bufferLength = buffer.byteLength
    for (let i = 0; i < bufferLength; i += 1)
        binary += String.fromCharCode(buffer[i])
    return window.btoa(binary)
}
