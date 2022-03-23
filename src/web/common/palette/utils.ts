const BLACK: ReadonlyArray<string> = [
    'rgba(0, 0, 0, 0.87)',
    'rgba(0, 0, 0, 0.6)',
    'rgba(0, 0, 0, 0.38)',
    'rgba(0, 0, 0, 0.12)',
    'rgba(0, 0, 0, 0.08)',
    'rgba(0, 0, 0, 0.04)',
]

const BRAND: ReadonlyArray<string> = [
    'rgb(229, 242, 250)',
    'rgb(156, 202, 236)',
    'rgb(99, 165, 221)',
    'rgb(65, 120, 184)',
    'rgb(45, 74, 134)',
]

const GREEN: ReadonlyArray<string> = [
    'rgb(230, 247, 236)',
    'rgb(156, 221, 178)',
    'rgb(77, 198, 123)',
    'rgb(19, 172, 89)',
    'rgb(0, 136, 65)',
]

const AQUA: ReadonlyArray<string> = [
    'rgb(224, 245, 251)',
    'rgb(125, 214, 236)',
    'rgb(35, 186, 218)',
    'rgb(0, 159, 191)',
    'rgb(0, 119, 140)',
]

const ORANGE: ReadonlyArray<string> = [
    'rgb(252, 243, 227)',
    'rgb(244, 203, 141)',
    'rgb(237, 168, 72)',
    'rgb(229, 144, 53)',
    'rgb(214, 116, 45)',
]

const PURPLE: ReadonlyArray<string> = [
    'rgb(243, 228, 233)',
    'rgb(205, 143, 233)',
    'rgb(169, 57, 218)',
    'rgb(136, 0, 204)',
    'rgb(95, 2, 166)',
]

const WARNING: ReadonlyArray<string> = [
    'rgb(252, 234, 239)',
    'rgb(229, 150, 161)',
    'rgb(228, 73, 95)',
    'rgb(218, 41, 71)',
    'rgb(187, 24, 56)',
]

// tslint:disable-next-line: no-magic-numbers
export const ORIGIN_COLOR = BRAND[3]

export const RESET_COLOR = 'transparent'

export const PALETTE: ReadonlyArray<string> = getPalette()
function getPalette(): ReadonlyArray<string> {
    const palatte = [...BLACK]
    const length = WARNING.length
    let i = 0
    while (i <= length - 1) {
        palatte.push(BRAND[i])
        palatte.push(GREEN[i])
        palatte.push(AQUA[i])
        palatte.push(ORANGE[i])
        palatte.push(PURPLE[i])
        palatte.push(WARNING[i])
        i += 1
    }

    return palatte
}

export function getNameColor(color: string): string {
    const limit = 2
    if (ORANGE.includes(color) &&
        ORANGE.indexOf(color) < ORANGE.length - limit)
        return ORANGE[limit + 1]
    if (AQUA.includes(color) &&
        AQUA.indexOf(color) < AQUA.length - limit)
        return AQUA[limit + 1]
    if (WARNING.includes(color) &&
        WARNING.indexOf(color) < WARNING.length - limit)
        return WARNING[limit + 1]
    if (BLACK.includes(color) &&
        BLACK.indexOf(color) >= limit)
        return BLACK[limit - 1]
    if (BRAND.includes(color) &&
        BRAND.indexOf(color) < BRAND.length - limit)
        return BRAND[limit + 1]
    if (PURPLE.includes(color) &&
        PURPLE.indexOf(color) < PURPLE.length - limit)
        return PURPLE[limit + 1]
    if (color === RESET_COLOR)
        return BLACK[0]
    return color
}
