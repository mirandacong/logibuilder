import {isException} from '@logi/base/ts/common/exception'
import {EMPTY_TOKEN, lex, lexSuccess} from '@logi/src/lib/dsl/lexer/v2'
import {buildEst} from '@logi/src/lib/dsl/semantic'
import {
    ColumnBuilder,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {
    assertIsEst,
    FormulaInfo,
    FormulaInfoBuilder,
    HEADLESS,
    Node,
    SubFormulaInfo,
} from '../node'

import {Operator as Type5} from './type5'

class Type5Internal extends Type5 {
    public buildInfoPublic(): readonly FormulaInfo[] {
        return this.buildFormulaInfo()
    }

    public collectInfoPublic(): readonly SubFormulaInfo[] {
        return this.collectFormulaInfo()
    }
}

describe('type5 test', (): void => {
    it('empty', (): void => {
        const walkInfo = new Map<Readonly<Node>, readonly FormulaInfo[]>()
        const infoA = new FormulaInfoBuilder()
            .head(HEADLESS)
            .op(undefined)
            .inNodes([])
            .build()
        const type5 = new Type5Internal('empty', [], EMPTY_TOKEN)
        walkInfo.set(type5, [infoA])
        const formulaInfoList = type5.buildInfoPublic()
        expect(formulaInfoList.length).toBe(1)
        const formulaInfo = formulaInfoList[0]
        expect(formulaInfo.head).toEqual(HEADLESS)
        expect(formulaInfo.inNodes.length).toBe(0)
        expect(formulaInfo.op).toBeDefined()
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
        ['source()', true],
        ['input()', true],
        ['input(1)', true],
        ['input({a})', true],
        ['input({a}.sum())', true],
        ['input1()', true],
        ['source2()', true],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: ValidateTestData): void => {
        it(d[0], (): void => {
            const expr = lex(d[0])
            if (!lexSuccess(expr))
                throw Error('')
            const row = new RowBuilder().name('row').expression(d[0]).build()
            const col1 = new ColumnBuilder().name('col1').build()
            const col2 = new ColumnBuilder().name('col2').build()
            new TableBuilder().name('table').subnodes([row, col1, col2]).build()
            const result = buildEst(expr)
            assertIsEst(result)
            expect(isException(result.validate())).toBe(d[1])
        })
    })
})
