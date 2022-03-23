import {isString} from '@logi/base/ts/common/type_guard'

/**
 * A TypeScript transcription of the `saveAs` function defined in `file-saver`.
 *
 * The interface is the same as `saveAs` as defined in `file-saver`.
 *
 * KNOWN LIMITATIONS:
 *  - Only works for Chrome and FireFox.
 *  - Specifically, does not work for NodeJs or any other browsers.
 */
export function saveAs(blob: Blob | string, filename: string): void {
    if (!('download' in HTMLAnchorElement.prototype))
        return
    // Chrome & Firefox
    const a = document.createElement('a')
    a.download = filename
    a.rel = 'noopener'
    a.href = isString(blob) ? blob : URL.createObjectURL(blob)
    eventClick(a)
    URL.revokeObjectURL(a.href)
}

function eventClick(node: HTMLElement): void {
    // tslint:disable-next-line: no-try
    try {
        node.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
        const evt = document.createEvent('MouseEvents')
        evt.initMouseEvent(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            0,
            0,
            // tslint:disable-next-line:no-null-keyword
            false,
            false,
            false,
            false,
            0,
            null,
        )
        node.dispatchEvent(evt)
    }
}
