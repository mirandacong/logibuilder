export function preventMouseEvent(e: MouseEvent): void {
    e.preventDefault()
    e.stopImmediatePropagation()
}
