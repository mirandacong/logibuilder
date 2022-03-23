import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    StandardHeader,
    StandardHeaderBuilder,
    TemplateSet,
} from '@logi/src/lib/template'

import {PayloadType} from '../payload'

import {Payload as Base} from './payload'

export interface Payload extends Base {
    readonly oldName: string
    readonly newName: string
}

class PayloadImpl extends Base implements Impl<Payload> {
    public oldName!: string
    public newName!: string
    public payloadType = PayloadType.RENAME_STANDARD_HEADER
}

export class PayloadBuilder extends Builder<Payload, PayloadImpl> {
    public constructor(obj?: Readonly<Payload>) {
        const impl = new PayloadImpl()
        if (obj)
            PayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public oldName(oldName: string): this {
        this.getImpl().oldName = oldName
        return this
    }

    public newName(newName: string): this {
        this.getImpl().newName = newName
        return this
    }

    protected get daa(): readonly string[] {
        return PayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'oldName',
        'newName',
    ]
}

export function isPayload(value: unknown): value is Payload {
    return value instanceof PayloadImpl
}

export function assertIsPayload(value: unknown): asserts value is Payload {
    if (!(value instanceof PayloadImpl))
        throw Error('Not a Payload!')
}

export function renameStandardHeader(
    set: TemplateSet,
    oldName: string,
    newName: string,
): void {
    // tslint:disable-next-line: no-type-assertion
    const headers = set.standardHeaders as StandardHeader[]
    const idx = headers.findIndex((h: StandardHeader): boolean =>
        h.name === oldName)
    if (idx < 0)
        return
    const newHeader = new StandardHeaderBuilder(headers[idx])
        .name(newName)
        .build()
    headers.splice(idx, 1, newHeader)
}
