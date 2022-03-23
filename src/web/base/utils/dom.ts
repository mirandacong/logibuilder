/**
 * See: https://stackoverflow.com/questions/5898656/check-if-an-element-contains-a-class-in-javascript
 */
export function hasClass(element: Element, className: string): boolean {
    if ((` ${element.className} `).indexOf(` ${className} `) > -1)
        return true
    return false
}

export function addClass(element: Element, className: string): void {
    if (element.classList !== undefined) {
        element.classList.add(className)
        return
    }
    if (!hasClass(element, className))
        element.className += '' + className
}

export function removeClass(element: Element, className: string): void {
    /**
     * Remove an empty class name will throw error.
     */
    if (className.trim().length === 0)
        return

    if (element.classList !== undefined) {
        element.classList.remove(className)
        return
    }
    /**
     * If browser not support `classList` (<= IE9).
     */
    if (hasClass(element, className)) {
        const reg = new RegExp(`(\\s|^)${className}(\\s|$)')`)
        element.className = element.className.replace(reg, ' ')
    }
}

export function toggleClass(element: Element, className: string): void {
    if (hasClass(element, className)) {
        removeClass(element, className)
        return
    }
    addClass(element, className)
}

export function hasScrollBar(el: HTMLElement): boolean {
    return el?.scrollHeight > el.clientHeight + 1
}

export function getActiveElement(el?: Document): Element | null {
    const doc = el ?? document
    return doc.activeElement
}

export function isFocused(el: HTMLElement): boolean {
    const doc = el.ownerDocument
    if (doc === null)
        return false
    const activeElement = getActiveElement()
    return activeElement === el
}

export function togglePasswordInputType(el: HTMLInputElement): void {
    const type = el.type
    if (type === 'text') {
        el.type = 'password'
        return
    }
    if (type === 'password')
        el.type = 'text'
}

export function getElementOffset(
    elem: HTMLElement,
): {readonly top: number, readonly left: number} {
    if (!elem.getClientRects().length)
        return {top: 0, left: 0}
    const rect = elem.getBoundingClientRect()
    const win = elem.ownerDocument!.defaultView
    return {
        left: rect.left + win!.pageXOffset,
        top: rect.top + win!.pageYOffset,
    }
}

export function silentEvent(e: Event): void {
    e.stopPropagation()
    e.preventDefault()
}
