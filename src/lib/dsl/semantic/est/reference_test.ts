// tslint:disable: no-magic-numbers
import {
    Column,
    ColumnBuilder,
    PartBuilder,
    PathBuilder,
    Row,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {HEADLESS} from './node'
import {Reference} from './reference'

describe('get op test', (): void => {
    let row1: Readonly<Row>
    let row2: Readonly<Row>
    let col1: Readonly<Column>
    let col2: Readonly<Column>
    let col3: Readonly<Column>
    beforeEach((): void => {
        col1 = new ColumnBuilder().name('col1').build()
        col2 = new ColumnBuilder().name('col2').build()
        col3 = new ColumnBuilder().name('col3').build()
        row1 = new RowBuilder().name('row1').build()
        row2 = new RowBuilder().name('row2').isDefScalar(true).build()
        new TableBuilder()
            .name('table')
            .subnodes([col1, col2, col3, row1, row2])
            .build()
    })
    it('row without def_scalar test', (): void => {
        const refPath = new PathBuilder()
            .parts([new PartBuilder().name('row1').build()])
            .build()
        const ref = new Reference(refPath)
        ref.hierarchyNode = row1
        const formulaInfo = ref.getFormulaInfo()
        expect(formulaInfo.length).toBe(3)
        expect(formulaInfo[0].head).toEqual(col1)
        expect(formulaInfo[0].inNodes).toEqual([[row1, col1]])
        expect(formulaInfo[1].head).toEqual(col2)
        expect(formulaInfo[1].inNodes).toEqual([[row1, col2]])
        expect(formulaInfo[2].head).toEqual(col3)
        expect(formulaInfo[2].inNodes).toEqual([[row1, col3]])
    })
    it('row def_scalar test', (): void => {
        const refPath = new PathBuilder()
            .parts([new PartBuilder().name('row1').build()])
            .build()
        const ref = new Reference(refPath)
        ref.hierarchyNode = row2
        const formulaInfo = ref.getFormulaInfo()
        expect(formulaInfo.length).toBe(1)
        expect(formulaInfo[0].head).toEqual(HEADLESS)
        expect(formulaInfo[0].inNodes).toEqual([[row2, col1]])
    })
})
