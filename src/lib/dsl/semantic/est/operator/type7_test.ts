// tslint:disable:no-magic-numbers
import {EMPTY_TOKEN} from '@logi/src/lib/dsl/lexer/v2'
import {
    Column,
    ColumnBlockBuilder,
    ColumnBuilder,
    PartBuilder,
    PathBuilder,
    Row,
    RowBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    FormulaInfo,
    FormulaInfoBuilder,
    Head,
    Node,
    SubFormulaInfo,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as Type7} from './type7'

class Type7Internal extends Type7 {
    public buildInfoPublic(
        subs: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        return this.buildFormulaInfo(subs)
    }

    public collectInfoPublic(walkInfo: WalkInfo): readonly SubFormulaInfo[] {
        return this.collectFormulaInfo(walkInfo)
    }
}

// tslint:disable-next-line: max-func-body-length
describe('type6 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let q12017: Readonly<Column>
    let q22017: Readonly<Column>
    let q12018: Readonly<Column>
    let q22018: Readonly<Column>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        q12017 = new ColumnBuilder().name('Q1').build()
        q22017 = new ColumnBuilder().name('Q2').build()
        new ColumnBlockBuilder().name('2017').tree([q12017, q22017]).build()
        q12018 = new ColumnBuilder().name('Q1').build()
        q22018 = new ColumnBuilder().name('Q2').build()
        new ColumnBlockBuilder().name('2018').tree([q12018, q22018]).build()
    })
    // tslint:disable-next-line: max-func-body-length
    it('{row1}.year() and {row1}.day()', (): void => {
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(q12017)
            .op(undefined)
            .inNodes([[row1, q12017]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(q22017)
            .op(undefined)
            .inNodes([[row1, q22017]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(q12018)
            .op(undefined)
            .inNodes([[row1, q12018]])
            .build()
        const formulaInfoA4 = new FormulaInfoBuilder()
            .head(q22018)
            .op(undefined)
            .inNodes([[row1, q22018]])
            .build()
        const pathRow1 = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoRow1 = new Reference(pathRow1)
        walkInfo.set(
            opInfoRow1,
            [formulaInfoA1, formulaInfoA2, formulaInfoA3, formulaInfoA4],
        )
        const yearTest = new Type7Internal('.year', [opInfoRow1], EMPTY_TOKEN)
        const yearSubs = yearTest.collectInfoPublic(walkInfo)
        const yearResult = yearTest.buildInfoPublic(yearSubs)
        expect(yearResult.length).toBe(4)
        expect(yearResult[0].op?.evaluate()).toBe(2017)
        expect(yearResult[0].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((yearResult[0].head as Head).name).toBe('Q1')

        expect(yearResult[1].op?.evaluate()).toBe(2017)
        expect(yearResult[1].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((yearResult[1].head as Head).name).toBe('Q2')

        expect(yearResult[2].op?.evaluate()).toBe(2018)
        expect(yearResult[2].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((yearResult[2].head as Head).name).toBe('Q1')

        expect(yearResult[3].op?.evaluate()).toBe(2018)
        expect(yearResult[3].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((yearResult[3].head as Head).name).toBe('Q2')

        const dayTest = new Type7Internal('.day', [opInfoRow1], EMPTY_TOKEN)
        const daySubs = dayTest.collectInfoPublic(walkInfo)
        const dayResult = dayTest.buildInfoPublic(daySubs)
        expect(dayResult.length).toBe(4)
        expect(dayResult[0].op?.evaluate()).toBe(1)
        expect(dayResult[0].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((dayResult[0].head as Head).name).toBe('Q1')

        expect(dayResult[1].op?.evaluate()).toBe(1)
        expect(dayResult[1].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((dayResult[1].head as Head).name).toBe('Q2')

        expect(dayResult[2].op?.evaluate()).toBe(1)
        expect(dayResult[2].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((dayResult[2].head as Head).name).toBe('Q1')

        expect(dayResult[3].op?.evaluate()).toBe(1)
        expect(dayResult[3].inNodes.length).toBe(0)
        // tslint:disable-next-line: no-type-assertion
        expect((dayResult[3].head as Head).name).toBe('Q2')
    })
})
