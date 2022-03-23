import {
    ColumnBuilder,
    Row,
    RowBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'

import {TriggerBuilder, TriggerType} from '../trigger'

import {SliceProvider} from './slice'

describe('slice provider', (): void => {
    let provider: SliceProvider
    let row: Readonly<Row>
    beforeEach((): void => {
        provider = new SliceProvider()
        const col = new ColumnBuilder().name('2017').build()
        const col2 = new ColumnBuilder().name('2017').build()
        const col3 = new ColumnBuilder().name('2016').labels(['2015']).build()
        row = new RowBuilder().name('row').build()
        new TableBuilder().name('t').subnodes([col, col2, col3, row]).build()
    })
    it('slice', (): void => {
        const trigger = new TriggerBuilder()
            .prefix('{row}')
            .text('[2]')
            .type(TriggerType.SLICE)
            .node(row)
            .build()
        const candis = provider.suggest(trigger)
        // tslint:disable: no-magic-numbers
        expect(candis[0].members.length).toBe(3)
        expect(candis[0].members[0].updateText).toBe('[2015]')
        expect(candis[0].members[1].updateText).toBe('[2016]')
        expect(candis[0].members[2].updateText).toBe('[2017]')
    })
})
