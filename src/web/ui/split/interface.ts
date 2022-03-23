import {SplitAreaDirective} from './directive'

export type Direction = 'vertical' | 'horizontal'

/**
 * Represent the mouse point.
 */
export interface Point {
    readonly x: number
    readonly y: number
}

/**
 * Represent the basic area information wrapped by logi-split-area.
 */
export interface Area {
    readonly component: SplitAreaDirective
    // tslint:disable-next-line: readonly-keyword
    order: number
    // tslint:disable-next-line: readonly-keyword
    size: number | undefined
    // tslint:disable-next-line: readonly-keyword
    minSize: number | undefined
    // tslint:disable-next-line: readonly-keyword
    maxSize: number | undefined
}

/**
 * Represent the snapshot while dragging.
 * CREATED ON DRAG START.
 */

export interface SplitSnapshot {
    readonly gutterNum: number
    readonly allAreasSizePixel: number
    // tslint:disable-next-line: readonly-keyword
    allInvolvedAreasSizePercent: number
    // tslint:disable-next-line: readonly-keyword
    lastSteppedOffset: number
    // tslint:disable-next-line: readonly-keyword readonly-array
    areasBeforeGutter: AreaSnapshot[]
    // tslint:disable-next-line: readonly-keyword readonly-array
    areasAfterGutter: AreaSnapshot[]
}

/**
 * Represent the basic information of snapshot.
 */
export interface AreaSnapshot {
    readonly area: Area
    readonly sizePixelAtStart: number
    readonly sizePercentAtStart: number
}

/**
 * Represent the area add or decrease while dragging.
 * CREATED ON DRAG PROGRESS.
 */

export interface SplitSideAbsorptionCapacity {
    readonly remain: number
    readonly list: readonly AreaAbsorptionCapacity[]
}

/**
 * The basic area absorption information.
 */
export interface AreaAbsorptionCapacity {
    readonly areaSnapshot: AreaSnapshot
    readonly pixelAbsorb: number
    // tslint:disable-next-line: readonly-keyword
    percentAfterAbsorption: number
    readonly pixelRemain: number
}

/**
 * Represent the basic information when observable emit.
 * CREATED TO SEND OUTSIDE.
 */

export interface OutputData {
    readonly gutterNum: number
    readonly sizes: OutputAreaSizes
}

export interface OutputAreaSizes extends Array<number | '*'> {}
