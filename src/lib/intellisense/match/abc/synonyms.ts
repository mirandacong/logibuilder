import {Builder} from '@logi/base/ts/common/builder'
import {Column, Row, Table} from '@logi/src/lib/hierarchy/core'
import {
    getEditDistLoss,
    getLcsLoss,
    ParasBuilder,
} from '@logi/src/lib/intellisense/algo'

import {
    getDataItems,
    getTableItems,
    MatchItem,
    MatchItemBuilder,
    SourceItem,
} from './item'

export interface MatchProvider {
    match(src: Readonly<Table>, target: readonly (readonly string[])[]):
        readonly Readonly<MatchItem>[]
}

class MatchProviderImpl implements MatchProvider {
    public dict!: Map<string, readonly number[]>
    public match(
        table: Readonly<Table>,
        data: readonly (readonly string[])[],
    ): readonly Readonly<MatchItem>[] {
        const tableItems = getTableItems(table)
        const dataItems = getDataItems(data)
        const result: MatchItem[] = []
        tableItems.forEach((ti: Readonly<SourceItem>): void => {
            dataItems.forEach((di: Readonly<SourceItem>): void => {
                const confidence = matchItems(ti, di, this.dict)
                if (confidence <= 0)
                    return
                const matchItem = new MatchItemBuilder()
                    .x(di.from[0] as number)
                    .y(di.from[1] as number)
                    .row(ti.from[0] as Readonly<Row>)
                    .col(ti.from[1] as Readonly<Column>)
                    .confidence(confidence)
                    .build()
                result.push(matchItem)
            })
        })
        return result
    }
}

export class MatchProviderBuilder extends
    Builder<MatchProvider, MatchProviderImpl> {
    public constructor(obj?: Readonly<MatchProvider>) {
        const impl = new MatchProviderImpl()
        if (obj)
            MatchProviderBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public synonyms(content: readonly string[]): this {
        const dict = buildSynomymDict(content)
        this.getImpl().dict = dict
        return this
    }

    protected preBuildHook(): void {
        if (this.getImpl().dict)
            return
        this.getImpl().dict = new Map<string, readonly number[]>()
        return
    }
}

/**
 * Build the synoymn dict. Every string in `content` has multiple words joint
 * by `||` and they share the same meaning.
 *
 * NOTE: Export this function only for test.
 */
export function buildSynomymDict(
    content: readonly string[],
): Map<string, readonly number[]> {
    const result = new Map<string, number[]>()
    // tslint:disable-next-line: no-loop-statement
    for (let i = 0; i < content.length; i += 1) {
        const keys = content[i].split('||')
        keys.forEach((s: string): void => {
            const key = s.trim().toLowerCase()
            if (result.has(key))
                result.set(key, [...result.get(key) as number[], i])
            else
                result.set(key, [i])
        })
    }
    return result
}

/**
 * NOTE: Export this function only for test.
 */
export function synonymsMatch(
    s1: string,
    s2: string,
    synonyms: Map<string, readonly number[]>,
): number {
    const l1 = s1.toLowerCase()
    const l2 = s2.toLowerCase()
    const loss = getLiteralLoss(l1, l2)
    const m1 = synonyms.get(l1)
    const m2 = synonyms.get(l2)
    if (!m1 || !m2)
        return (1 - loss)
    const meaning1 = m1 as number[]
    const meaning2 = m2 as number[]
    for (const i of meaning1)
        for (const j of meaning2)
            if (i === j)
                return 1
    return (1 - loss)
}

/**
 * Export this function only for test.
 */
export function getLiteralLoss(s1: string, s2: string): number {
    const l1 = s1.replace(/ /g, '')
    const l2 = s2.replace(/ /g, '')
    const threshold = 0.3
    const reduction = 0.6
    const editConfig = new ParasBuilder()
        .matchThreshold(s2.length * threshold)
        .reductionRatio(reduction)
        .build()
    let editLoss = getEditDistLoss(s1, s2, editConfig)
    if (editLoss < 0) // do not match
        editLoss = 1
    const lcsConfig = new ParasBuilder()
        .matchThreshold(0)
        .reductionRatio(reduction)
        .build()
    const lcsLoss = getLcsLoss(l1, l2, lcsConfig)
    // tslint:disable-next-line: no-magic-numbers
    const loss = (editLoss + lcsLoss) * 0.5
    if (loss >= 0 && loss < 1)
        return loss
    return 1
}

/**
 * Judge if these 2 items is matched.
 * Return the confidence of this match.
 *
 * NOTE: Export this function only for test.
 */
export function matchItems(
    src: Readonly<SourceItem>,
    target: Readonly<SourceItem>,
    dict: Map<string, readonly number[]>,
): number {
    const rowCon = synonymsMatch(src.row, target.row, dict)
    if (target.col === '')
        return rowCon
    const colCon = synonymsMatch(src.col, target.col, dict)
    if (colCon === 0)
        // tslint:disable-next-line: no-magic-numbers
        return rowCon * 0.7
    // tslint:disable-next-line: no-magic-numbers
    return (rowCon + colCon) * 0.5
}
