/**
 * Creates a browser MouseEvent with the specified options.
 */
export function createMouseEvent(type: string, x = 0, y = 0): MouseEvent {
    return new MouseEvent(
        type,
        {
            bubbles: true,
            clientX: x,
            clientY: y,
        },
    )
}

/**
 * Creates a fake event object with any desired event type.
 */
export function createFakeEvent(
    type: string,
    bubbles = false,
    cancelable = true,
): Event {
    return new Event(type, {bubbles, cancelable})
}
