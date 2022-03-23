/**
 * @param target copy target
 * @param names current name list
 */
export function getCopyName(target: string, names: readonly string[]): string {
    const regx = /\(([0-9]+)\)$/g
    const curMatch = target.split(regx).filter((
        sub: string,
    ): boolean => sub.length >= 1)
    const start = names
        .filter((name: string): boolean => name.startsWith(curMatch[0]))
    if (start.length < 1)
        return target
    let curIndex = 0
    start.forEach((name: string): void => {
        const list = name.split(regx).filter((sub: string): boolean =>
            sub.length >= 1)
        if (list.length <= 1)
            return
        curIndex = isNaN(Number(list[1])) ? curIndex :
            (Number(list[1]) >= curIndex ? Number(list[1]) : curIndex)
    })
    return `${curMatch[0]} (${curIndex + 1})`
}
