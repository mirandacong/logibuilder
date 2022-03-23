import {readFileSync} from 'fs'

import {ConsumerVersionBuilder, ProducerVersionBuilder} from './impl'

describe('version test', (): void => {
    it('checkConsumer should pass', (): void => {
        const version = new ProducerVersionBuilder()
            .producer(1)
            .minConsumer(1)
            .badConsumers([])
            .build()
        const consumerVersion = new ConsumerVersionBuilder()
            .consumer(1)
            .minProducer(1)
            .build()
        expect(version.checkConsumer(consumerVersion)).toBe(true)
    })
    it('checkConsumer should not pass', (): void => {
        const version = new ProducerVersionBuilder()
            .producer(1)
            // tslint:disable-next-line: no-magic-numbers
            .minConsumer(2)
            .badConsumers([])
            .build()
        const consumerVersion = new ConsumerVersionBuilder()
            .consumer(1)
            .minProducer(1)
            .build()
        expect(version.checkConsumer(consumerVersion)).not.toBeTruthy()
    })
    it('dump test', (): void => {
        const version = new ProducerVersionBuilder()
            .producer(1)
            .minConsumer(1)
            .badConsumers([])
            .build()
        const content = version.dump()
        const expected = [
            'badConsumers: []',
            'producer: 1',
            'minConsumer: 1',
            '',
        ]
        expect(content).toEqual(expected.join('\n'))
    })
    it('load test', (): void => {
        const path = __dirname + '/test_version'
        const content = readFileSync(path, 'utf-8')
        const version = ProducerVersionBuilder.load(content).build()
        expect(version.minConsumer).toEqual(1)
        expect(version.producer).toEqual(1)
        expect(version.badConsumers).toEqual([])
    })
})
