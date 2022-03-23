import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {SourceManager} from '@logi/src/lib/source'

import {Payload, PayloadType} from '../payload'

export interface SetSourceManagerPayload extends Payload {
    readonly sourceManager: SourceManager
}

class SetSourceManagerPayloadImpl implements Impl<SetSourceManagerPayload> {
    public sourceManager!: SourceManager
    public payloadType = PayloadType.SET_SOURCE_MANAGER
}

export class SetSourceManagerPayloadBuilder extends
    Builder<SetSourceManagerPayload, SetSourceManagerPayloadImpl> {
    public constructor(obj?: Readonly<SetSourceManagerPayload>) {
        const impl = new SetSourceManagerPayloadImpl()
        if (obj)
            SetSourceManagerPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sourceManager(sourceManager: SourceManager): this {
        this.getImpl().sourceManager = sourceManager
        return this
    }

    protected get daa(): readonly string[] {
        return SetSourceManagerPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'sourceManager',
    ]
}

export function isSetSourceManagerPayload(
    value: unknown,
): value is SetSourceManagerPayload {
    return value instanceof SetSourceManagerPayloadImpl
}

export function assertIsSetSourceManagerPayload(
    value: unknown,
): asserts value is SetSourceManagerPayload {
    if (!(value instanceof SetSourceManagerPayloadImpl))
        throw Error('Not a SetSourceManagerPayload!')
}
