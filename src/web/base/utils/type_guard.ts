import Long from 'long'
// tslint:disable: naming-convention
export function isElement(target: unknown): target is Element {
    return target instanceof Element
}

export function isHTMLElement(target: unknown): target is HTMLElement {
    return target instanceof HTMLElement
}

export function isHTMLSpanElement(target: unknown): target is HTMLSpanElement {
    return target instanceof HTMLSpanElement
}

export function isHTMLInputElement(
    target: unknown,
): target is HTMLInputElement {
    return target instanceof HTMLInputElement
}

export function isPromise<T>(obj: unknown): obj is Promise<T> {
    // @ts-expect-error type-guard
    // tslint:disable-next-line: no-double-negation
    return !!obj && typeof obj.then === 'function' && typeof obj.catch === 'function'
}

export function isLong(obj: unknown): obj is Long {
    return Long.isLong(obj)
}

export function isNumber(obj: unknown): obj is number {
    return !Number.isNaN(Number(obj))
}
