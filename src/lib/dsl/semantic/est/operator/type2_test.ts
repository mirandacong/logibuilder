import {isException} from '@logi/base/ts/common/exception'
import {Op, OP_REGISTRY} from '@logi/src/lib/compute/op'
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
import {Operator as Type2} from './type2'
import {Operator as Type9} from './type9'

class Type2Internal extends Type2 {
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
describe('type2 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let addOp: Readonly<Op>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        new TableBuilder().name('t').subnodes([row1, row2, col1, col2]).build()
        const add = 'add'
        addOp = OP_REGISTRY.get(add) as Op
    })
    it('{a}[col1::this].sum()', (): void => {
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        opInfoA.hierarchyNode = row1
        const rangeOp = new Type9('[col1::this]', [opInfoA], EMPTY_TOKEN)
        walkInfo.set(rangeOp, rangeOp.getFormulaInfo())
        const test2 = new Type2Internal('.sum', [rangeOp], EMPTY_TOKEN)
        const subs = test2.collectInfoPublic(walkInfo)
        const result = test2.buildInfoPublic(subs)
        // tslint:disable: no-magic-numbers
        expect(result.length).toBe(2)
        expect(result[0].head).toBe(col1)
        expect(result[0].inNodes).toEqual([[row1, col1]])
        expect(result[1].head).toBe(col2)
        expect(result[1].inNodes).toEqual([[row1, col1], [row1, col2]])
    })
    it('{a}.sum()', (): void => {
        const infoA = new FormulaInfoBuilder()
            .head(HEADLESS)
            .op(undefined)
            .inNodes([[row1, col1], [row1, col2]])
            .build()
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        walkInfo.set(opInfoA, [infoA])
        const test2 = new Type2Internal('.sum', [opInfoA], EMPTY_TOKEN)
        const subs = test2.collectInfoPublic(walkInfo)
        const result = test2.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(HEADLESS)
        expect(result[0].inNodes).toEqual([[row1, col1], [row1, col2]])
    })
    // tslint:disable-next-line: max-func-body-length
    it('({a} + {b}).sum()', (): void => {
        const infoA1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const infoA2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        const infoB1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row2, col1]])
            .build()
        const infoB2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row2, col2]])
            .build()
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
        const pathB = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoB = new Reference(pathB)
        walkInfo.set(opInfoA, [infoA1, infoA2])
        walkInfo.set(opInfoB, [infoB1, infoB2])
        const add = new Type1('+', [opInfoA, opInfoB], EMPTY_TOKEN)
        const infoAdd1 = new FormulaInfoBuilder()
            .head(col1)
            .op(addOp)
            .inNodes([[row1, col1], [row2, col1]])
            .build()
        const infoAdd2 = new FormulaInfoBuilder()
            .head(col2)
            .op(addOp)
            .inNodes([[row1, col2], [row2, col2]])
            .build()
        walkInfo.set(add, [infoAdd1, infoAdd2])
        const sum = new Type2Internal('.sum', [add], EMPTY_TOKEN)
        const subs = sum.collectInfoPublic(walkInfo)
        const result = sum.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(HEADLESS)
        expect(result[0].inNodes).toEqual(
            [[row1, col1], [row2, col1], [row1, col2], [row2, col2]],
        )
    })
})

type ValidateTestData = readonly [
    // expression
    string,
    // is exception
    boolean
]

describe('validate test', (): void => {
    const data: readonly ValidateTestData[] = [
        ['{a}.average()', false],
        ['{a}.min()', false],

        ['{a}.average({b})', true],
        ['{a}.average({b}.sum())', true],
        ['{a}.average({b}.sum(), 3)', true],
        ['{a}.average(1)', true],
        ['{a}.average(1, 2)', true],
        ['{a}.min(1)', true],
        ['{a}.max(0)', true],
        ['{a}.max(0, 1)', true],
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
