import {createFakeEvent} from './event_objects'

/**
 * Utility to dispatch any event on a node.
 */
export function dispatchEvent(node: Node | Window, event: Event): Event {
    node.dispatchEvent(event)
    return event
}

/**
 * Shorthand to dispatch a fake event on a specified node.
 */
export function dispatchFakeEvent(
    node: Node | Window,
    type: string,
    canBubble = true,
): Event {
    return dispatchEvent(node, createFakeEvent(type, canBubble))
}
