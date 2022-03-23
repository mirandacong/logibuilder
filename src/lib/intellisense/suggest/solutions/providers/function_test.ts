import {supportedOpInfoNames} from '@logi/src/lib/dsl/semantic'
import {Book, BookBuilder} from '@logi/src/lib/hierarchy/core'

import {TriggerBuilder, TriggerType} from '../trigger'

import {FunctionProvider} from './function'

describe('function providers', (): void => {
    let dummy: Readonly<Book>
    let provider: FunctionProvider
    beforeEach((): void => {
        dummy = new BookBuilder().name('dummy').build()
        provider = new FunctionProvider()
    })
    it('prefix', (): void => {
        const trigger = new TriggerBuilder()
            .text('ma')
            .node(dummy)
            .type(TriggerType.FUNCTION)
            .build()
        const result = provider.suggest(trigger)
        expect(result.length).toBe(1)
        expect(result[0].members.length).toBe(1)
        expect(result[0].members[0].view[0].content).toBe('MAX()')
        // tslint:disable: no-magic-numbers
        expect(result[0].members[0].cursorOffset).toBe(4)
    })
    it('suffix', (): void => {
        const trigger = new TriggerBuilder()
            .text('.ma')
            .node(dummy)
            .type(TriggerType.FUNCTION)
            .build()
        const result = provider.suggest(trigger)
        expect(result.length).toBe(1)
        expect(result[0].members.length).toBe(1)
        expect(result[0].members[0].view[0].content).toBe('.max()')
        expect(result[0].members[0].cursorOffset).toBe(6)
        const trigger2 = new TriggerBuilder()
            .text('.')
            .node(dummy)
            .type(TriggerType.FUNCTION)
            .build()
        const result2 = provider.suggest(trigger2)
        expect(result2[0].members.length).toBe(supportedOpInfoNames()
            .filter(op => op.startsWith('.')).length)
    })
})
