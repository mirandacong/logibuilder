// tslint:disable: function-signature-length-limit
export function getOptionScrollPosition(
    // tslint:disable-next-line: max-params
    optionIndex: number,
    optionHeight: number,
    currentScrollPosition: number,
    panelHeight: number,
): number {
    const optionOffset = optionIndex * optionHeight
    if (optionOffset < currentScrollPosition)
        return optionOffset
    if (optionOffset + optionHeight > currentScrollPosition + panelHeight)
        return Math.max(0, optionOffset - panelHeight + optionHeight)
    return currentScrollPosition
}
