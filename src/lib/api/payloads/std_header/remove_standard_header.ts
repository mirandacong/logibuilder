import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {StandardHeader, TemplateSet} from '@logi/src/lib/template'

import {PayloadType} from '../payload'

import {Payload as Base} from './payload'

export interface Payload extends Base {
    readonly name: string
}

class PayloadImpl extends Base implements Impl<Payload> {
    public name!: string
    public payloadType = PayloadType.REMOVE_STANDARD_HEADER
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['name']
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}

export function removeStandardHeader(set: TemplateSet, name: string): void {
    // tslint:disable-next-line: no-type-assertion
    const headers = set.standardHeaders as StandardHeader[]
    const idx = headers.findIndex((h: StandardHeader): boolean =>
        h.name === name)
    if (idx < 0)
        return
    headers.splice(idx, 1)
}
