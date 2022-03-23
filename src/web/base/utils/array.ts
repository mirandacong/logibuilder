export function isArrayEqual<T>(a1: readonly T[], a2: readonly T[]): boolean {
    if (!a1 || !a2 || a1.length !== a2.length)
        return false
    const len = a1.length
    for (let i = 0; i < len; i += 1)
        if (a1[i] !== a2[i])
            return false
    return true
}
