/**
 * This function only supprt for pasting HTMI or FireFox <=22
 * more details see
 * https://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718
 */
export function pastePlainText(el: ClipboardEvent): void {
    const data = el.clipboardData?.getData('text/plain')
    if (data === undefined)
        return
    el.preventDefault()
    document.execCommand('insertText', false, data)
}
