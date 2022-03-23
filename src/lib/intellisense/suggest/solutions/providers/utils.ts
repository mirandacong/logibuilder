import {Candidate} from '../candidate'

export class PathView {
    public constructor(
        public readonly namespace: string,
        public readonly refname: string,
    ) {}
}

export function filterWord(word: string, filters: readonly string[]): boolean {
    const segs = word.split(' ')
    return !segs.every((s: string): boolean => filters.includes(s))
}

export function groupCandidatesByKey(
    members: readonly Readonly<Candidate>[],
): Map<string, readonly Readonly<Candidate>[]> {
    const resultMap = new Map<string, Readonly<Candidate>[]>()
    members.forEach((m: Readonly<Candidate>): void => {
        if (m.handle === undefined)
            return
        const key = m.handle.groupByKey
        const array = resultMap.get(key)
        if (array !== undefined)
            array.push(m)
        else
            resultMap.set(key, [m])
    })
    return resultMap
}
