// tslint:disable:no-magic-numbers
import {isException} from '@logi/base/ts/common/exception'
import {EMPTY_TOKEN, lex, lexSuccess} from '@logi/src/lib/dsl/lexer/v2'
import {buildEst} from '@logi/src/lib/dsl/semantic'
import {
    Column,
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
    HEADLESS,
    Node,
    SubFormulaInfo,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as Type1} from './type1'

class Type1Internal extends Type1 {
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
describe('type1 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        col3 = new ColumnBuilder().name('col3').build()
    })
    it('{a} + {b} all', (): void => {
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
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2])
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
        const pathB = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoB = new Reference(pathB)
        walkInfo.set(opInfoB, [formulaInfoB1, formulaInfoB2])
        const test1 = new Type1Internal('+', [opInfoA, opInfoB], EMPTY_TOKEN)
        const subs = test1.collectInfoPublic(walkInfo)
        const result = test1.buildInfoPublic(subs)
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col1)
        expect(result[1].head).toBe(col2)
        expect(result[0].inNodes).toEqual([[row1, col1], [row2, col1]])
        expect(result[1].inNodes).toEqual([[row1, col2], [row2, col2]])
    })
    it('{a} + {b} partial', (): void => {
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
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2])
        const formulaInfoB1 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row2, col2]])
            .build()
        const formulaInfoB2 = new FormulaInfoBuilder()
            .head(col3)
            .op(undefined)
            .inNodes([[row2, col3]])
            .build()
        const pathB = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoB = new Reference(pathB)
        walkInfo.set(opInfoB, [formulaInfoB1, formulaInfoB2])
        const test1 = new Type1Internal('+', [opInfoA, opInfoB], EMPTY_TOKEN)
        const subs = test1.collectInfoPublic(walkInfo)
        const result = test1.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(col2)
        expect(result[0].inNodes).toEqual([[row1, col2], [row2, col2]])
    })
    it('3 * 5', (): void => {
        const constant3 = new Constant(3, '3')
        const constant5 = new Constant(5, '5')
        const formulas3 = constant3.getFormulaInfo()
        const formulas5 = constant5.getFormulaInfo()
        walkInfo.set(constant3, formulas3)
        walkInfo.set(constant5, formulas5)
        const test1 = new Type1Internal('*', [constant3, constant5], EMPTY_TOKEN)
        const subs = test1.collectInfoPublic(walkInfo)
        const result = test1.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(HEADLESS)
        expect(result[0].inNodes).toEqual([])
    })
})

type ValidateTestData = readonly [
    // expression
    string,
    // is exception
    boolean
]

// tslint:disable-next-line: max-func-body-length
describe('validate test', (): void => {
    const data: readonly ValidateTestData[] = [
        ['average({a})', false],
        ['average(1)', false],
        ['average({a}, {b})', false],
        ['average({a}.sum(), {a})', false],
        ['sum({a})', false],
        ['sum(1, 2)', false],
        ['sum({a}, {b})', false],
        ['sum({a}, {a}.average(), {b})', false],
        ['min({a})', false],
        ['min({a}, {b})', false],
        ['+1', false],
        ['1+1', false],
        ['iferror({a}, {b})', false],
        ['power({a}, {b})', false],
        ['switch({a}, {b}, {c}, {d})', false],
        ['cos(1)', false],
        ['sin(1)', false],
        ['cos({a}.sum())', false],
        ['sin({a}.sum())', false],
        ['cos(1)', false],

        ['sin(1, {a})', true],
        ['sin(1, 2)', true],
        ['average()', true],
        ['min()', true],
        ['iferror({a}, {b}, 0)', true],
        ['iferror(0)', true],
        ['power({a}, {b}, 0)', true],
        ['switch({a})', true],
        ['log({a}.sum())', true],
        ['log(3)', true],
        ['round({a}.sum())', true],
        ['round({a})', true],
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
