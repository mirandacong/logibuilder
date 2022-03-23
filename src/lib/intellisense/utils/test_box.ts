/**
 * Provide a easy way to initialize a map for testing.
 */
export function initializeMap(
    values: readonly (readonly [number, number])[],
): Map<number, number> {
    const map = new Map<number, number>()
    values.forEach((value: readonly [number, number]): void => {
        map.set(value[0], value[1])
    })

    return map
}
