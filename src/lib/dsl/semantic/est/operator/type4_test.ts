// tslint:disable:no-magic-numbers
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

import {Operator as Type2} from './type2'
import {Operator as Type4} from './type4'

class Type4Internal extends Type4 {
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
describe('type4 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let averageOp: Readonly<Op>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        const average = 'average'
        // tslint:disable-next-line: no-type-assertion
        averageOp = OP_REGISTRY.get(average) as Op
    })
    it('npv(3, 5)', (): void => {
        const constant3 = new Constant(3, '3')
        const constant5 = new Constant(5, '5')
        const formulas3 = constant3.getFormulaInfo()
        const formulas5 = constant5.getFormulaInfo()
        walkInfo.set(constant3, formulas3)
        walkInfo.set(constant5, formulas5)
        const test4 = new Type4Internal('npv', [constant3, constant5], EMPTY_TOKEN)
        const subs = test4.collectInfoPublic(walkInfo)
        const result = test4.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(HEADLESS)
        expect(result[0].inNodes).toEqual([])
    })
    it('npv(5, {row1}.average())', (): void => {
        const constant5 = new Constant(5, '5')
        const formulas5 = constant5.getFormulaInfo()
        walkInfo.set(constant5, formulas5)
        const pathA = new PathBuilder()
            .parts([new PartBuilder().name('dummy').build()])
            .build()
        const opInfoA = new Reference(pathA)
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
        walkInfo.set(opInfoA, [formulaInfoA1, formulaInfoA2])
        const type2Node = new Type2('average', [opInfoA], EMPTY_TOKEN)
        const formulaInfoType2 = new FormulaInfoBuilder()
            .head(HEADLESS)
            .op(averageOp)
            .inNodes([[row1, col1], [row1, col2]])
            .build()
        walkInfo.set(type2Node, [formulaInfoType2])
        const type4Node = new Type4Internal('npv', [constant5, type2Node], EMPTY_TOKEN)
        const subs = type4Node.collectInfoPublic(walkInfo)
        const result = type4Node.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(HEADLESS)
        expect(result[0].inNodes).toEqual([[row1, col1], [row1, col2]])
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
        ['npv(0.5, {a})', false],
        ['irr({a})', false],
        ['log(2, 3)', false],
        ['round(5.45, 1)', false],
        ['irr({a}.sum())', false],

        ['irr(1)', true],
        ['irr(1, 2)', true],
        ['irr({a}, 2)', true],
        ['npv({a})', true],
        ['npv({a}.sum())', true],
        ['npv({a}, 0.5)', true],
        ['npv(2)', true],
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
