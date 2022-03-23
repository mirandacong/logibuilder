import {Frequency as FrequencyEnum} from '@logi/src/lib/template'
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Frequency {
    readonly id: FrequencyEnum
    readonly text: string
}

class FrequencyImpl implements Impl<Frequency> {
    public id!: FrequencyEnum
    public text = ''
}

export class FrequencyBuilder extends Builder<Frequency, FrequencyImpl> {
    public constructor(obj?: Readonly<Frequency>) {
        const impl = new FrequencyImpl()
        if (obj)
            FrequencyBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public id(id: FrequencyEnum): this {
        this.getImpl().id = id
        return this
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    protected get daa(): readonly string[] {
        return FrequencyBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'id',
    ]
}

export function isFrequency(value: unknown): value is Frequency {
    return value instanceof FrequencyImpl
}

export function assertIsFrequency(value: unknown): asserts value is Frequency {
    if (!(value instanceof FrequencyImpl))
        throw Error('Not a Frequency!')
}
