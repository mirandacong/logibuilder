// tslint:disable: naming-convention
export function assertIsElement(target: unknown): asserts target is Element {
    if (target instanceof Element)
        return
    throw Error('Not a Element!')
}

export function assertIsHTMLElement(
    target: unknown,
): asserts target is HTMLElement {
    if (target instanceof HTMLElement)
        return
    throw Error('Not a HTMLElement!')
}

export function assertIsHTMLInputElement(
    target: unknown,
): asserts target is HTMLInputElement {
    if (target instanceof HTMLInputElement)
        return
    throw Error('Not a HTMLInputElement!')
}
