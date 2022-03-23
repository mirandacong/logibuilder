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
    HEADLESS,
    Node,
    SubFormulaInfo,
    WalkInfo,
} from '../node'
import {Reference} from '../reference'

import {Operator as Type6} from './type6'

class Type6Internal extends Type6 {
    public buildInfoPublic(
        subs: readonly SubFormulaInfo[],
    ): readonly FormulaInfo[] {
        return this.buildFormulaInfo(subs)
    }

    public collectInfoPublic(walkInfo: WalkInfo): readonly SubFormulaInfo[] {
        return this.collectFormulaInfo(walkInfo)
    }
}

describe('type6 test', (): void => {
    let walkInfo: Map<Readonly<Node>, readonly FormulaInfo[]>
    let row1: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    beforeEach((): void => {
        walkInfo = new Map<Readonly<Node>, FormulaInfo[]>()
        row1 = new RowBuilder().name('row1').build()
        col1 = new ColumnBuilder().name('col1').labels(['hist']).build()
        col2 = new ColumnBuilder().name('col2').labels(['proj']).build()
        new TableBuilder().name('table').subnodes([row1, col1, col2]).build()
    })
    it('row1[proj]', (): void => {
        const row1Path = new PathBuilder()
            .parts([new PartBuilder().name('row1').build()])
            .build()
        const ref1 = new Reference(row1Path)
        ref1.hierarchyNode = row1
        const formulaInfoCol1 = new FormulaInfoBuilder()
            .head(col1)
            .op(undefined)
            .inNodes([[row1, col1]])
            .build()
        const formulaInfoCol2 = new FormulaInfoBuilder()
            .head(col2)
            .op(undefined)
            .inNodes([[row1, col2]])
            .build()
        walkInfo.set(ref1, [formulaInfoCol1, formulaInfoCol2])
        const type6 = new Type6Internal('[proj]', [ref1], EMPTY_TOKEN)
        const subs = type6.collectInfoPublic(walkInfo)
        const result = type6.buildInfoPublic(subs)
        expect(result.length).toBe(1)
        expect(result[0].head).toBe(HEADLESS)
        expect(result[0].inNodes).toEqual([[row1, col2]])
    })
})
