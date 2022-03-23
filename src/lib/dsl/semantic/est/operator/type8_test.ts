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
    Head,
    Headless,
    Node,
    SubFormulaInfo,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as Type8} from './type8'

class Type8Internal extends Type8 {
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
describe('type8 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let c2017: Readonly<Column>
    let c2018: Readonly<Column>
    let c2019: Readonly<Column>
    let c2020: Readonly<Column>
    let constant1: Readonly<Constant>
    let constant2: Readonly<Constant>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        c2017 = new ColumnBuilder().name('c2017').build()
        c2018 = new ColumnBuilder().name('c2018').build()
        c2019 = new ColumnBuilder().name('c2019').build()
        c2020 = new ColumnBuilder().name('c2020').build()
        constant1 = new Constant(1, '1')
        constant2 = new Constant(4, '4')
    })
    it('{row1}.linear(1, 4)', (): void => {
        const info1 = new FormulaInfoBuilder()
            .head(c2017)
            .op(undefined)
            .inNodes([[row1, c2017]])
            .build()
        const info2 = new FormulaInfoBuilder()
            .head(c2018)
            .op(undefined)
            .inNodes([[row1, c2018]])
            .build()
        const info3 = new FormulaInfoBuilder()
            .head(c2019)
            .op(undefined)
            .inNodes([[row1, c2019]])
            .build()
        const info4 = new FormulaInfoBuilder()
            .head(c2020)
            .op(undefined)
            .inNodes([[row1, c2020]])
            .build()
        const path = new PathBuilder()
            .parts([new PartBuilder().name('row1').build()])
            .build()
        const opInfo = new Reference(path)
        walkInfo.set(opInfo, [info1, info2, info3, info4])
        walkInfo.set(constant1, constant1.getFormulaInfo())
        walkInfo.set(constant2, constant2.getFormulaInfo())
        const linear = new Type8Internal('.linear', [constant1, constant2, opInfo], EMPTY_TOKEN)
        const subs = linear.collectInfoPublic(walkInfo)
        const result = linear.buildInfoPublic(subs)
        expect(result.length).toBe(4)
        const heads = result.map((c: FormulaInfo): Head | Headless => c.head)
        expect(heads).toEqual([c2017, c2018, c2019, c2020])
        expect(result[0].op).toBeDefined()
    })
})

describe('validate test', (): void => {
    const data: readonly [string, boolean][] = [
        ['{a}.linear(1, 4)', false],
        ['{a}.linear(1, 4, 2)', true],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: [string, boolean]): void => {
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
