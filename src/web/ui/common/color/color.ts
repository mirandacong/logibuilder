export const PRESETCOLORS: readonly string[] = [
    'arisblue',
    'blue',
    'green',
    'grey',
    'orange',
    'red',
]

export type PresetColor = typeof PRESETCOLORS[number]

// tslint:disable-next-line: unknown-paramenter-for-type-predicate
export function isPresetColor(color: string): color is PresetColor {
    return PRESETCOLORS.indexOf(color) !== -1
}

export const PRESETCOLORSMAP = new Map<PresetColor, string>([
    ['arisblue', '#4178B8'],
    ['blue', '#0044CC'],
    ['green', '#13AC59'],
    ['grey', '#000000'],
    ['orange', '#E59035'],
    ['red', '#DA2947'],
])

/**
 * rgb(0,48,204) => #0044CC
 */
export function rgbToHex(str: string): string {
    const rgbArr = str.split('(')[1].split(')')[0].split(',')
    const res = rgbArr.map(x => {
        // tslint:disable-next-line: ban radix
        const b = parseInt(x).toString(16)
        return b.length === 1 ? '0' + b : b
    })
    return '#' + res.join('')
}
