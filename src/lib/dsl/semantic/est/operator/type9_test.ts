import {EMPTY_TOKEN} from '@logi/src/lib/dsl/lexer/v2'
import {
    Column,
    ColumnBuilder,
    PartBuilder,
    PathBuilder,
    Row,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    FormulaInfo,
    FormulaInfoBuilder,
    Node,
    SubFormulaInfo,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as Type9} from './type9'

class Type9Internal extends Type9 {
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
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let col4: Readonly<Column>
    let ref: Reference
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        col1 = new ColumnBuilder().name('col1').labels(['2014']).build()
        col2 = new ColumnBuilder().name('col2').labels(['2015']).build()
        col3 = new ColumnBuilder().name('col3').labels(['2015']).build()
        col4 = new ColumnBuilder().name('col4').labels(['2016']).build()
        new TableBuilder()
            .name('table')
            .subnodes([row1, col1, col2, col3, col4])
            .build()
        const row1Path = new PathBuilder()
            .parts([new PartBuilder().name('row1').build()])
            .build()
        ref = new Reference(row1Path)
        ref.hierarchyNode = row1
        const info1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const info2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const info3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        const info4 = new FormulaInfoBuilder()
            .head(col4)
            .op(undefined)
            .inNodes([[row1, col4]])
            .build()
        walkInfo.set(ref, [info1, info2, info3, info4])
    })
    it('row1[2014::2016]', (): void => {
        const type9 = new Type9Internal('[2014::2016]', [ref], EMPTY_TOKEN)
        const subs = type9.collectInfoPublic(walkInfo)
        const result = type9.buildInfoPublic(subs)
        // tslint:disable: no-magic-numbers
        expect(result.length).toBe(4)
        expect(result[0].head).toBe(col1)
        expect(result[0].inNodes).toEqual([[row1, col1], [row1, col4]])
        expect(result[1].head).toBe(col2)
        expect(result[1].inNodes).toEqual([[row1, col1], [row1, col4]])
        expect(result[2].head).toBe(col3)
        expect(result[2].inNodes).toEqual([[row1, col1], [row1, col4]])
        expect(result[3].head).toBe(col4)
        expect(result[3].inNodes).toEqual([[row1, col1], [row1, col4]])
    })
    it('row1[2016::2014]', (): void => {
        const type9 = new Type9Internal('[2016::2014]', [ref], EMPTY_TOKEN)
        const subs = type9.collectInfoPublic(walkInfo)
        const result = type9.buildInfoPublic(subs)
        expect(result.length).toBe(4)
        expect(result[0].head).toBe(col1)
        expect(result[0].inNodes).toEqual([[row1, col4], [row1, col1]])
    })
    it('row1[2014::this]', (): void => {
        const type9 = new Type9Internal('[2014::this]', [ref], EMPTY_TOKEN)
        const subs = type9.collectInfoPublic(walkInfo)
        const result = type9.buildInfoPublic(subs)
        // tslint:disable: no-magic-numbers
        expect(result.length).toBe(4)
        expect(result[0].head).toBe(col1)
        expect(result[0].inNodes).toEqual([[row1, col1]])
        expect(result[1].head).toBe(col2)
        expect(result[1].inNodes).toEqual([[row1, col1], [row1, col2]])
        expect(result[2].head).toBe(col3)
        expect(result[2].inNodes).toEqual([[row1, col1], [row1, col3]])
        expect(result[3].head).toBe(col4)
        expect(result[3].inNodes).toEqual([[row1, col1], [row1, col4]])
    })
    it('row1[this::2016]', (): void => {
        const type9 = new Type9Internal('[this::2016]', [ref], EMPTY_TOKEN)
        const subs = type9.collectInfoPublic(walkInfo)
        const result = type9.buildInfoPublic(subs)
        expect(result.length).toBe(4)
        expect(result[0].head).toBe(col1)
        expect(result[0].inNodes).toEqual([[row1, col1], [row1, col4]])
        expect(result[1].head).toBe(col2)
        expect(result[1].inNodes).toEqual([[row1, col2], [row1, col4]])
        expect(result[2].head).toBe(col3)
        expect(result[2].inNodes).toEqual([[row1, col3], [row1, col4]])
        expect(result[3].head).toBe(col4)
        expect(result[3].inNodes).toEqual([[row1, col4]])
    })
    it('empty', (): void => {
        const type9 = new Type9Internal('[2014::2015]', [ref], EMPTY_TOKEN)
        const subs = type9.collectInfoPublic(walkInfo)
        const result = type9.buildInfoPublic(subs)
        expect(result.length).toBe(0)
    })
})
