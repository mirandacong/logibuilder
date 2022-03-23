import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {SliceExpr} from '@logi/src/lib/hierarchy/core'

import {Payload as Base, PayloadType} from '../payload'

export interface FocusHierarchyPayload extends Base {
    readonly uuid: string
    readonly slice?: Readonly<SliceExpr>
}

class FocusHierarchyPayloadImpl implements Impl<FocusHierarchyPayload> {
    public uuid!: string
    public slice?: Readonly<SliceExpr>
    public payloadType = PayloadType.FOCUS_HIERARCHY
}

export class FocusHierarchyPayloadBuilder extends
    Builder<FocusHierarchyPayload, FocusHierarchyPayloadImpl> {
    public constructor(obj?: Readonly<FocusHierarchyPayload>) {
        const impl = new FocusHierarchyPayloadImpl()
        if (obj)
            FocusHierarchyPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public slice(slice: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
        return this
    }

    protected get daa(): readonly string[] {
        return FocusHierarchyPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['uuid']
}

export function isFocusHierarchyPayload(
    value: unknown,
): value is FocusHierarchyPayload {
    return value instanceof FocusHierarchyPayloadImpl
}

export function assertIsFocusHierarchyPayload(
    value: unknown,
): asserts value is FocusHierarchyPayload {
    if (!(value instanceof FocusHierarchyPayloadImpl))
        throw Error('Not a FocusHierarchyPayload!')
}
