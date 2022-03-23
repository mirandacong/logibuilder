const BASE64_MARKER = ';base64,'

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
