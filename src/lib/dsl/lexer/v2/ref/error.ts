import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface RefError {
    readonly type: RefErrorType
    readonly image: string
}

class RefErrorImpl implements Impl<RefError> {
    public type!: RefErrorType
    public image!: string
}

export class RefErrorBuilder extends Builder<RefError, RefErrorImpl> {
    public constructor(obj?: Readonly<RefError>) {
        const impl = new RefErrorImpl()
        if (obj)
            RefErrorBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: RefErrorType): this {
        this.getImpl().type = type
        return this
    }

    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    protected get daa(): readonly string[] {
        return RefErrorBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'image',
        'type',
    ]
}

export function isRefError(value: unknown): value is RefError {
    return value instanceof RefErrorImpl
}

export function assertIsRefError(value: unknown): asserts value is RefError {
    if (!(value instanceof RefErrorImpl))
        throw Error('Not a RefError!')
}

export const enum RefErrorType {
    EXPECTED,
    UNRECOGNIZED,
}
