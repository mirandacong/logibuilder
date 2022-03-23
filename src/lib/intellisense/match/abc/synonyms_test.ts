import {getCurrentDir} from '@logi/base/ts/spreadjs/bazel'
import {readFileSync} from 'fs'
import {join} from 'path'

import {SourceItemBuilder} from './item'
import {
    buildSynomymDict,
    getLiteralLoss,
    matchItems,
    synonymsMatch,
} from './synonyms'

describe('abc match', (): void => {
    let dict: Map<string, readonly number[]>
    beforeEach((): void => {
        const file = '../../dict/synonyms.txt'
        const filePath = join(getCurrentDir(__dirname), file)
        const data = readFileSync(filePath, 'utf-8')
        const words = data.split('\n')
        dict = buildSynomymDict(words)
    })
    it('string snonyms match', (): void => {
        const s1 = 'revenue'
        const s2 = 'revenu'
        expect(synonymsMatch(s1, s2, dict)).toBeGreaterThan(0)
        const s3 = 'APD'
        const s4 = 'Accounting Period'
        expect(synonymsMatch(s3, s4, dict)).toBeGreaterThan(0)
    })
    it('item match', (): void => {
        const item1 = new SourceItemBuilder()
            .row('revenue')
            .col('APD')
            .from([-1, -1])
            .build()
        const item2 = new SourceItemBuilder()
            .row('revenu')
            .col('Accounting Period')
            .from([-1, -1])
            .build()
        expect(matchItems(item1, item2, dict)).toBeGreaterThan(0)
        const item3 = new SourceItemBuilder()
            .row('revenu')
            .col('')
            .from([-1, -1])
            .build()
        expect(matchItems(item1, item3, dict)).toBeGreaterThan(0)
    })
})

describe('literal loss', (): void => {
    it('lcs match should not match the space', (): void => {
        const target = 'product 1'
        const s1 = 'product1'
        const s2 = 'product 2'
        const l1 = getLiteralLoss(s1, target)
        const l2 = getLiteralLoss(s2, target)
        expect(l1).toBeLessThan(l2)
    })
    it('the loss of exact match should be less', (): void => {
        const target = '2019'
        const s1 = '2019'
        const s2 = '2018'
        const l1 = getLiteralLoss(s1, target)
        const l2 = getLiteralLoss(s2, target)
        expect(l1).toBeLessThan(l2)
    })
})
