import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Type} from '@logi/src/lib/hierarchy/core'

export interface CleanType {
    readonly type: Type,
    readonly name: string,
    readonly completed: boolean
    updataComplated(c: boolean): void
}

class CleanTypeImpl implements Impl<CleanType> {
    public type!: Type
    public name!: string
    public completed!: boolean
    public updataComplated(c: boolean): void {
        this.completed = c
    }
}

export class CleanTypeBuilder extends Builder<CleanType, CleanTypeImpl> {
    public constructor(obj?: Readonly<CleanType>) {
        const impl = new CleanTypeImpl()
        if (obj)
            CleanTypeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public completed(completed: boolean): this {
        this.getImpl().completed = completed
        return this
    }

    protected get daa(): readonly string[] {
        return CleanTypeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['type', 'name', 'completed']
}

export function isCleanType(value: unknown): value is CleanType {
    return value instanceof CleanTypeImpl
}

export function assertIsCleanType(value: unknown): asserts value is CleanType {
    if (!(value instanceof CleanTypeImpl))
        throw Error('Not a CleanType!')
}

export function typeList(): readonly CleanType[] {
    return [
        new CleanTypeBuilder().type(Type.FX).name('计算').completed(true).build(),
        new CleanTypeBuilder()
            .type(Type.FACT)
            .name('事实')
            .completed(true)
            .build(),
        new CleanTypeBuilder()
            .type(Type.ASSUMPTION)
            .name('假设')
            .completed(true)
            .build(),
    ]
}
