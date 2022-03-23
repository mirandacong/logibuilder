/**
 * Dispatch contextmenu manually.
 * Aften use in left button function to trigger contextmenu.
 */
export function dispatchContextmenu(e: MouseEvent): void {
    const event = new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY,
    })
    e.target?.dispatchEvent(event)
    e.stopPropagation()
}
