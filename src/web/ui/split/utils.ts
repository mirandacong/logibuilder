import {ElementRef} from '@angular/core'

import {
    Area,
    AreaAbsorptionCapacity,
    AreaSnapshot,
    Point,
    SplitSideAbsorptionCapacity,
} from './interface'

export function getPointFromEvent(event: MouseEvent | TouchEvent): Point {
    // TouchEvent
    if ((event as TouchEvent).changedTouches
        && (event as TouchEvent).changedTouches.length > 0)
        return {
            x: (event as TouchEvent).changedTouches[0].clientX,
            y: (event as TouchEvent).changedTouches[0].clientY,
        }
    // MouseEvent
    /**
     * Safe to use type assertion below for event is MouseEvent or TouchEvent.
     */
    const mouseEvent = event as MouseEvent
    return {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
    }
}

export function getElementPixelSize(
    elRef: ElementRef,
    direction: 'horizontal' | 'vertical',
): number {
    // tslint:disable-next-line: ter-newline-after-var
    const rect = (elRef.nativeElement as HTMLElement).getBoundingClientRect()

    return (direction === 'horizontal') ? rect.width : rect.height
}

export function getInputBoolean(v: boolean | string): boolean {
    return (typeof(v) === 'boolean') ? v : (v === 'false' ? false : true)
}

export function getInputPositiveNumber<T>(
    // tslint:disable-next-line: unknown-instead-of-any
    v: any,
    defaultValue: T,
): number | T {
    if (v < 0)
        return defaultValue
    // tslint:disable-next-line: ter-newline-after-var
    const value = Number(v)

    return !isNaN(v) && value >= 0 ? value : defaultValue
}

export function isUserSizesValid(
    unit: 'percent' | 'pixel',
    sizes: readonly (number | undefined)[],
): boolean {
    // All sizes have to be not null and total should be 100
    if (unit === 'percent')
        return sizes.every((s: number | undefined) => s !== undefined)

    // A size at null is mandatory but only one.
    return sizes.filter((s: number | undefined) => !s).length === 1
}

export function getAreaMinSize(a: Area): undefined | number {
    if (!a.size)
        return

    if (a.component.lockSize)
        return a.size

    if (!a.component.minSize)
        return

    if (a.component.minSize > a.size)
        return a.size

    return a.component.minSize
}

export function getAreaMaxSize(a: Area): undefined | number {
    if (!a.size)
        return

    if (a.component.lockSize)
        return a.size

    if (!a.component.maxSize)
        return

    if (a.component.maxSize < a.size)
        return a.size

    return a.component.maxSize
}

export function getGutterSideAbsorptionCapacity(
    // tslint:disable-next-line: max-params
    unit: 'percent' | 'pixel',
    sideAreas: readonly AreaSnapshot[],
    pixels: number,
    allAreasSizePixel: number,
): SplitSideAbsorptionCapacity {
    // tslint:disable-next-line: typedef
    return sideAreas.reduce(
        (
        // tslint:disable-next-line: readonly-keyword
            acc: { remain: number; readonly list: never[]},
            area: AreaSnapshot,
        ) => {
            const res = getAreaAbsorptionCapacity(
                unit,
                area,
                acc.remain,
                allAreasSizePixel,
            )
            acc.list.push(res as never)
            acc.remain = res.pixelRemain

            return acc
        },
        {remain: pixels, list: []},
    )
}

function getAreaAbsorptionCapacity(
    // tslint:disable-next-line: max-params
    unit: 'percent' | 'pixel',
    areaSnapshot: AreaSnapshot,
    pixels: number,
    allAreasSizePixel: number,
): AreaAbsorptionCapacity {
    // No pain no gain
    if (pixels === 0)
        return {
            areaSnapshot,
            percentAfterAbsorption: areaSnapshot.sizePercentAtStart,
            pixelAbsorb: 0,
            pixelRemain: 0,
        }

    // Area start at zero and need to be reduced, not possible
    if (areaSnapshot.sizePixelAtStart === 0 && pixels < 0)
        return {
            areaSnapshot,
            percentAfterAbsorption: 0,
            pixelAbsorb: 0,
            pixelRemain: pixels,
        }

    if (unit === 'percent')
        return getAreaAbsorptionCapacityPercent(
            areaSnapshot,
            pixels,
            allAreasSizePixel,
        )

    return getAreaAbsorptionCapacityPixel(
        areaSnapshot,
        pixels,
        allAreasSizePixel,
    )
}

// tslint:disable-next-line: max-func-body-length
function getAreaAbsorptionCapacityPercent(
    areaSnapshot: AreaSnapshot,
    pixels: number,
    allAreasSizePixel: number,
): AreaAbsorptionCapacity {
    const percent = 100
    const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels
    const tempPercentSize = tempPixelSize / allAreasSizePixel * percent
    // ENLARGE AREA
    if (pixels > 0) {
        /**
         * If maxSize & newSize bigger than it > absorb to max and return
         * remaining pixels
         */
        if (areaSnapshot.area.maxSize &&
            tempPercentSize > areaSnapshot.area.maxSize) {
            /**
             * Use area.area.maxSize as newPercentSize and return calculate
             * pixels remaining
             */
            // tslint:disable-next-line: ter-newline-after-var
            const maxSizePixel = areaSnapshot.area.maxSize / percent
                * allAreasSizePixel

            return {
                areaSnapshot,
                percentAfterAbsorption: areaSnapshot.area.maxSize,
                pixelAbsorb: maxSizePixel,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels
                    - maxSizePixel,
            }
        }

        return {
            areaSnapshot,
            percentAfterAbsorption: tempPercentSize > percent ? percent
                : tempPercentSize,
            pixelAbsorb: pixels,
            pixelRemain: 0,
        }
    }

    /**
     * REDUCE AREA
     * If minSize & newSize smaller than it > absorb to min and return
     * remaining pixels.
     */
    if (areaSnapshot.area.minSize &&
        tempPercentSize < areaSnapshot.area.minSize) {
        /**
         * Use area.area.minSize as newPercentSize and return calculate
         * pixels remaining.
         */
        // tslint:disable-next-line: ter-newline-after-var
        const minSizePixel = areaSnapshot.area.minSize / percent
            * allAreasSizePixel

        return {
            areaSnapshot,
            percentAfterAbsorption: areaSnapshot.area.minSize,
            pixelAbsorb: minSizePixel,
            pixelRemain: areaSnapshot.sizePixelAtStart + pixels - minSizePixel,
        }
    }
    if (tempPercentSize < 0)
        /**
         * If reduced under zero > return remaining pixels.
         * Use 0 as newPercentSize and return calculate pixels remaining.
         */
        return {
            areaSnapshot,
            percentAfterAbsorption: 0,
            pixelAbsorb: -areaSnapshot.sizePixelAtStart,
            pixelRemain: pixels + areaSnapshot.sizePixelAtStart,
        }

    return {
        areaSnapshot,
        percentAfterAbsorption: tempPercentSize,
        pixelAbsorb: pixels,
        pixelRemain: 0,
    }
}

// tslint:disable-next-line: no-suspicious-comment
/**
 * TODO (minglong): know more about why containerSizePixel is no used.
 */
// tslint:disable-next-line: max-func-body-length
function getAreaAbsorptionCapacityPixel(
    areaSnapshot: AreaSnapshot,
    pixels: number,
    // @ts-ignore
    // tslint:disable-next-line: no-unused
    containerSizePixel: number,
): AreaAbsorptionCapacity {
    const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels
    // ENLARGE AREA
    if (pixels > 0) {
        /**
         * If maxSize & newSize bigger than it > absorb to max and return
         * remaining pixels
         */
        if (areaSnapshot.area.maxSize &&
            tempPixelSize > areaSnapshot.area.maxSize)
            return {
                areaSnapshot,
                percentAfterAbsorption: -1,
                pixelAbsorb: areaSnapshot.area.maxSize -
                    areaSnapshot.sizePixelAtStart,
                pixelRemain: tempPixelSize - areaSnapshot.area.maxSize,
            }

        return {
            areaSnapshot,
            percentAfterAbsorption: -1,
            pixelAbsorb: pixels,
            pixelRemain: 0,
        }
    }

    // REDUCE AREA

    // tslint:disable-next-line: no-suspicious-comment
    /**
     * TODO (minglong): know more about when pixels is 0.
     */
    // else if (pixels < 0) {
    /**
     * If minSize & newSize smaller than it > absorb to min and return
     * remaining pixels.
     */
    if (areaSnapshot.area.minSize && tempPixelSize < areaSnapshot.area.minSize)
        return {
            areaSnapshot,
            percentAfterAbsorption: -1,
            pixelAbsorb: areaSnapshot.area.minSize + pixels - tempPixelSize,
            pixelRemain: tempPixelSize - areaSnapshot.area.minSize,
        }
    // If reduced under zero > return remaining pixels
    if (tempPixelSize < 0)
        return {
            areaSnapshot,
            percentAfterAbsorption: -1,
            pixelAbsorb: -areaSnapshot.sizePixelAtStart,
            pixelRemain: pixels + areaSnapshot.sizePixelAtStart,
        }

    return {
        areaSnapshot,
        percentAfterAbsorption: -1,
        pixelAbsorb: pixels,
        pixelRemain: 0,
    }
}

export function updateAreaSize(
    unit: 'percent' | 'pixel',
    item: AreaAbsorptionCapacity,
): void {
    if (unit === 'percent')
        item.areaSnapshot.area.size = item.percentAfterAbsorption
    else if (unit === 'pixel' && item.areaSnapshot.area.size)
        // Update size except for the wildcard size area
        item.areaSnapshot.area.size = item.areaSnapshot.sizePixelAtStart
            + item.pixelAbsorb
}
