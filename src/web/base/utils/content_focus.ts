import {isUndefinedOrNull} from '@logi/base/ts/common/type_guard'
import {timer} from 'rxjs'

export function dbClickFocus(el: HTMLElement): void {
        /**
         * You need to set a certain time delay effect,
         * otherwise the focus event and contenteditable = true
         * will be triggered at the same time,
         * causing the cursor to be unable to focus to elemnt
         */
    const timeOut = 10
    timer(timeOut).subscribe((): void => {
        setCursorToEnd(el)
    })
}

function setCursorToEnd(inputel: HTMLElement): void {
    const textNode = inputel.firstChild
    if (textNode === null)
        return
    const pos = inputel.textContent?.length
    if (isUndefinedOrNull(pos))
        return
    const range = document.createRange()
    const caret = window.getSelection()
    range.setStart(textNode, pos)
    range.setEnd(textNode, pos)
    inputel.focus()
    caret?.removeAllRanges()
    caret?.addRange(range)
}
