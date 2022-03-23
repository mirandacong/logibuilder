import {Book, BookBuilder} from '@logi/src/lib/hierarchy/core'

import {Provider} from '../provider'
import {TriggerBuilder, TriggerType} from '../trigger'

import {DictProviderBuilder} from './dict'

describe('dict provider', (): void => {
    const data = [
        'Share Holders',
        'Tax Rate',
        'Biological Assets At Cost',
        'Short-Term Investments',
    ]
    let provider!: Provider
    let dummy!: Readonly<Book>
    beforeEach((): void => {
        provider = new DictProviderBuilder().data(data).build()
        dummy = new BookBuilder().name('dummy').build()
    })
    it('empty', (): void => {
        const trigger = new TriggerBuilder()
            .text('')
            .type(TriggerType.DICT)
            .node(dummy)
            .build()
        const result = provider.suggest(trigger)
        const group = result[0]
        expect(group.filters.length).toBe(0)
        expect(group.members.length).toBe(0)
    })
    it('match', (): void => {
        const trigger = new TriggerBuilder()
            .text('BAAC')
            .type(TriggerType.DICT)
            .node(dummy)
            .build()
        const result = provider.suggest(trigger)
        expect(result.length).toBe(1)
        const group = result[0]
        expect(group.members.length).toBe(1)
        const candidate = group.members[0]
        expect(candidate.view[0].content).toBe('Biological Assets At Cost')
        // expect(candidate.cursorOffset.activeToken).toBe(1)
    })
})
