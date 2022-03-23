type MatchInfo = readonly [string, Map<number, number>]

/**
 * Get the recommended words whose prefix matches the input.
 *
 * Sorted by the length of the words.
 */
export function prefixMatch(
    pattern: string,
    beMatched: readonly string[],
    caseSensitive = true,
): readonly MatchInfo[] {
    const result: MatchInfo[] = []
    // tslint:disable-next-line: no-loop
    for (const word of beMatched) {
        const target = caseSensitive ? pattern : pattern.toLowerCase()
        const candidateWord = caseSensitive ? word : word.toLowerCase()
        if (!candidateWord.startsWith(target))
            continue
        const word2Index = new Map<number, number>()
        for (let i = 0; i < target.length; i += 1)
            word2Index.set(i, i)
        result.push([word, word2Index] as MatchInfo)
    }

    return result
}
