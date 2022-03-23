// tslint:disable:no-magic-numbers max-file-line-count
import {DatetimeDeltaBuilder} from '@logi/base/ts/common/datetime'
import {isException} from '@logi/base/ts/common/exception'
import {Op, OP_REGISTRY} from '@logi/src/lib/compute/op'
import {EMPTY_TOKEN, lex, lexSuccess} from '@logi/src/lib/dsl/lexer/v2'
import {buildEst} from '@logi/src/lib/dsl/semantic'
import {
    Column,
    ColumnBlockBuilder,
    ColumnBuilder,
    PartBuilder,
    PathBuilder,
    Row,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {Constant} from '../constant'
import {
    FormulaInfo,
    FormulaInfoBuilder,
    Node,
    SubFormulaInfo,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as Type1} from './type1'
import {Operator as Type3} from './type3'

class Type3Internal extends Type3 {
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
describe('type3 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let addOp: Readonly<Op>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        col1 = new ColumnBuilder().name('2016').build()
        col2 = new ColumnBuilder().name('2017').build()
        col3 = new ColumnBuilder().name('2018').build()
        const add = 'add'
        addOp = OP_REGISTRY.get(add) as Op
    })
    it('{a}.lag(1)', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const constant1 = new Constant(1, '1')
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2, formulaInfoA3])
        const test3 = new Type3Internal('.lag', [constant1, opInfoA], EMPTY_TOKEN)
        const subs = test3.collectInfoPublic(walkInfo)
        const result = test3.buildInfoPublic(subs)
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col2)
        expect(result[1].head).toBe(col3)
        expect(result[0].inNodes).toEqual([[row1, col1]])
        expect(result[1].inNodes).toEqual([[row1, col2]])
    })
    it('{a}.lead(1)', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const constant1 = new Constant(1, '1')
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2, formulaInfoA3])
        const test3 = new Type3Internal('.lead', [constant1, opInfoA], EMPTY_TOKEN)
        const subs = test3.collectInfoPublic(walkInfo)
        const result = test3.buildInfoPublic(subs)
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col1)
        expect(result[1].head).toBe(col2)
        expect(result[0].inNodes).toEqual([[row1, col2]])
        expect(result[1].inNodes).toEqual([[row1, col3]])
    })
    it('{a}.lag(1Y)', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const oneYear = new DatetimeDeltaBuilder().year(1).build()
        const constant1 = new Constant(oneYear, '1y')
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2, formulaInfoA3])
        const test3 = new Type3Internal('.lag', [constant1, opInfoA], EMPTY_TOKEN)
        const subs = test3.collectInfoPublic(walkInfo)
        const result = test3.buildInfoPublic(subs)
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col2)
        expect(result[1].head).toBe(col3)
        expect(result[0].inNodes).toEqual([[row1, col1]])
        expect(result[1].inNodes).toEqual([[row1, col2]])
    })
    it('{a}.lead(1Y)', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const oneYear = new DatetimeDeltaBuilder().year(1).build()
        const constant1 = new Constant(oneYear, '1y')
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2, formulaInfoA3])
        const test3 = new Type3Internal('.lead', [constant1, opInfoA], EMPTY_TOKEN)
        const subs = test3.collectInfoPublic(walkInfo)
        const result = test3.buildInfoPublic(subs)
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col1)
        expect(result[1].head).toBe(col2)
        expect(result[0].inNodes).toEqual([[row1, col2]])
        expect(result[1].inNodes).toEqual([[row1, col3]])
    })
    // tslint:disable-next-line: max-func-body-length
    it('({a} + {b}).lag(1)', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const pathB = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoB = new Reference(pathB)
        const constant1 = new Constant(1, '1')
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        const formulaInfoB1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row2, col1]])
            .build()
        const formulaInfoB2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row2, col2]])
            .build()
        const formulaInfoB3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row2, col3]])
            .build()
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2, formulaInfoA3])
        walkInfo.set(opInfoB, [formulaInfoB1, formulaInfoB2, formulaInfoB3])
        const add = new Type1('+', [opInfoA, opInfoB], EMPTY_TOKEN)
        const formulaInfoAdd1 = new FormulaInfoBuilder()
            .head(col1)
            .op(addOp)
            .inNodes([[row1, col1], [row2, col1]])
            .build()
        const formulaInfoAdd2 = new FormulaInfoBuilder()
            .head(col2)
            .op(addOp)
            .inNodes([[row1, col2], [row2, col2]])
            .build()
        const formulaInfoAdd3 = new FormulaInfoBuilder()
            .head(col3)
            .op(addOp)
            .inNodes([[row1, col3], [row2, col3]])
            .build()
        walkInfo.set(add, [formulaInfoAdd1, formulaInfoAdd2, formulaInfoAdd3])
        const test3 = new Type3Internal('.lag', [constant1, add], EMPTY_TOKEN)
        const subs = test3.collectInfoPublic(walkInfo)
        const result = test3.buildInfoPublic(subs)
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col2)
        expect(result[1].head).toBe(col3)
        expect(result[0].inNodes).toEqual([[row1, col1], [row2, col1]])
        expect(result[1].inNodes).toEqual([[row1, col2], [row2, col2]])
    })
})

// tslint:disable-next-line: max-func-body-length
describe('type3 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    let col4: Readonly<Column>
    let col5: Readonly<Column>
    let col6: Readonly<Column>
    let col7: Readonly<Column>
    let col8: Readonly<Column>

    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        col1 = new ColumnBuilder().name('Q1').build()
        col2 = new ColumnBuilder().name('Q2').build()
        col3 = new ColumnBuilder().name('Q3').build()
        col4 = new ColumnBuilder().name('Q4').build()
        new ColumnBlockBuilder()
            .name('2016')
            .tree([col1, col2, col3, col4])
            .build()
        col5 = new ColumnBuilder().name('Q1').build()
        col6 = new ColumnBuilder().name('Q2').build()
        col7 = new ColumnBuilder().name('Q3').build()
        col8 = new ColumnBuilder().name('Q4').build()
        new ColumnBlockBuilder()
            .name('2017')
            .tree([col5, col6, col7, col8])
            .build()
    })
    // tslint:disable-next-line: max-func-body-length
    it('{a}.lag(1Y)', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const oneYear = new DatetimeDeltaBuilder().year(1).build()
        const constant1 = new Constant(oneYear, '1y')
        const formulaInfoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const formulaInfoA3 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row1, col3]])
            .build()
        const formulaInfoA4 = new FormulaInfoBuilder()
            .head(col4)
            .op(undefined)
            .inNodes([[row1, col4]])
            .build()
        const formulaInfoA5 = new FormulaInfoBuilder()
            .head(col5)
            .op(undefined)
            .inNodes([[row1, col5]])
            .build()
        const formulaInfoA6 = new FormulaInfoBuilder()
            .head(col6)
            .op(undefined)
            .inNodes([[row1, col6]])
            .build()
        const formulaInfoA7 = new FormulaInfoBuilder()
            .head(col7)
            .op(undefined)
            .inNodes([[row1, col7]])
            .build()
        const formulaInfoA8 = new FormulaInfoBuilder()
            .head(col8)
            .op(undefined)
            .inNodes([[row1, col8]])
            .build()
        walkInfo.set(opInfoA, [
            formulaInfoA1,
            formulaInfoA2,
            formulaInfoA3,
            formulaInfoA4,
            formulaInfoA5,
            formulaInfoA6,
            formulaInfoA7,
            formulaInfoA8])
        const test3 = new Type3Internal('lag', [constant1, opInfoA], EMPTY_TOKEN)
        const subs = test3.collectInfoPublic(walkInfo)
        const result = test3.buildInfoPublic(subs)
        expect(result.length).toBe(4)
        expect(result[0].head).toEqual(col5)
        expect(result[1].head).toEqual(col6)
        expect(result[2].head).toEqual(col7)
        expect(result[3].head).toEqual(col8)
        expect(result[0].inNodes).toEqual([[row1, col1]])
        expect(result[1].inNodes).toEqual([[row1, col2]])
        expect(result[2].inNodes).toEqual([[row1, col3]])
        expect(result[3].inNodes).toEqual([[row1, col4]])
    })
})

type ValidateTestData = readonly [
    // expression
    string,
    // is exception
    boolean
]

describe('validate test', (): void => {
    const data: ValidateTestData[] = [
        ['{a}.lag(1)', false],
        ['{a}.lag(100)', false],
        ['{a}.lead(1)', false],
        ['{a}.lag(-1)', false],
        ['{a}.lead(-1)', false],

        ['{a}.lag()', true],
        ['{a}.lead()', true],
        ['{a}.lag(1, 2)', true],
        ['{a}.lead(1, 2)', true],
        ['{a}.lag({b})', true],
        ['{a}.lag({b}, {c})', true],
        ['{a}.lag(sum({b}))', true],
        ['{a}.lag({b}.sum())', true],
        ['{a}.lag(sum({b}), 2)', true],
        ['{a}.lag(3, {b}.sum())', true],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: ValidateTestData): void => {
        it(d[0], (): void => {
            const expr = lex(d[0])
            if (!lexSuccess(expr))
                throw Error('')
            const row = new RowBuilder().name('row').build()
            new TableBuilder().name('table').subnodes([row]).build()
            const result = buildEst(expr)
            expect(isException(result)).toBe(false)
            if (isException(result))
                return
            expect(isException(result.validate())).toBe(d[1])
        })
    })
})
