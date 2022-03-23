import {Book, BookBuilder} from '@logi/src/lib/hierarchy/core'

import {TriggerBuilder, TriggerType} from '../trigger'

import {KeywordProvider} from './keyword'

describe('function providers', (): void => {
    let dummy: Readonly<Book>
    let provider: KeywordProvider
    beforeEach((): void => {
        dummy = new BookBuilder().name('dummy').build()
        provider = new KeywordProvider()
    })
    it('keyword null', (): void => {
        const trigger = new TriggerBuilder()
            .text('nu')
            .node(dummy)
            .type(TriggerType.FUNC_OR_REF)
            .build()
        const result = provider.suggest(trigger)
        expect(result.length).toBe(1)
        expect(result[0].members.length).toBe(1)
        expect(result[0].members[0].view[0].content).toBe('NULL')
        // tslint:disable: no-magic-numbers
        expect(result[0].members[0].cursorOffset).toBe(4)
    })
    it('keyword none', (): void => {
        const trigger = new TriggerBuilder()
            .text('non')
            .node(dummy)
            .type(TriggerType.FUNC_OR_REF)
            .build()
        const result = provider.suggest(trigger)
        expect(result.length).toBe(1)
        expect(result[0].members.length).toBe(0)
    })
})
