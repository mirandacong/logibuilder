// tslint:disable-next-line: readonly-array
export type SliderValue = number[] | number

// tslint:disable: readonly-keyword
export interface SliderHandler {
    offset: number | null
    value: number | null
    active: boolean
}
