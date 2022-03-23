import {Builder} from '@logi/base/ts/common/builder'
import {safeDump, safeLoad} from 'js-yaml'

/**
 * Proto version control information. Get more information about version in
 * 'protos/version_def.proto'.
 */
export interface ProducerVersion {
    readonly producer: number
    readonly minConsumer: number
    readonly badConsumers: readonly number[]
    checkConsumer(consumerVersion: ConsumerVersion): boolean
    dump(): string
}

class ProducerVersionImpl implements ProducerVersion {
    public producer!: number
    public minConsumer!: number
    public badConsumers: readonly number[] = []

    public checkConsumer(consumerVersion: ConsumerVersion): boolean {
        if (this.producer < consumerVersion.minProducer
            || consumerVersion.consumer < this.minConsumer
            || this.badConsumers.includes(consumerVersion.consumer))
            return false
        return true
    }

    public dump(): string {
        return safeDump(this)
    }
}

export class ProducerVersionBuilder
    extends Builder<ProducerVersion, ProducerVersionImpl> {
    public constructor(obj?: Readonly<ProducerVersion>) {
        const impl = new ProducerVersionImpl()
        if (obj)
            ProducerVersionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public static load(content: string): ProducerVersionBuilder {
        const version = safeLoad(content)
        return new ProducerVersionBuilder()
            .producer(version.producer_version.producer)
            .minConsumer(version.producer_version.min_consumer)
            .badConsumers(version.producer_version.bad_consumers)
    }

    public producer(producer: number): this {
        this.getImpl().producer = producer
        return this
    }

    public minConsumer(minConsumer: number): this {
        this.getImpl().minConsumer = minConsumer
        return this
    }

    public badConsumers(badConsumers: readonly number[]): this {
        this.getImpl().badConsumers = badConsumers
        return this
    }

    protected get daa(): readonly string[] {
        return ProducerVersionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'producer',
        'minConsumer',
    ]
}

export interface ConsumerVersion {
    readonly consumer: number
    readonly minProducer: number
}

class ConsumerVersionImpl implements ConsumerVersion {
    public consumer!: number
    public minProducer!: number
}

export class ConsumerVersionBuilder extends
    Builder<ConsumerVersion, ConsumerVersionImpl> {
    public constructor(obj?: Readonly<ConsumerVersion>) {
        const impl = new ConsumerVersionImpl()
        if (obj)
            ProducerVersionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public static load(content: string): ConsumerVersionBuilder {
        const version = safeLoad(content)
        return new ConsumerVersionBuilder()
            .consumer(version.producer_version.producer)
            .minProducer(version.producer_version.min_consumer)
    }

    public consumer(consumer: number): ConsumerVersionBuilder {
        this.getImpl().consumer = consumer

        return this
    }

    public minProducer(minProducer: number): ConsumerVersionBuilder {
        this.getImpl().minProducer = minProducer

        return this
    }

    protected get daa(): readonly string[] {
        return ConsumerVersionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'consumer',
        'minProducer',
    ]
}
