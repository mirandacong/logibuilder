import {Builder} from '@logi/base/ts/common/builder'

/**
 * 后端不同场景下的User数据结构不同, 前端在类型不一致时可以统一转为该结构处理
 */
export interface BaseUser {
    readonly id: string
    readonly name: string
}

class BaseUserImpl implements BaseUser {
    public id!: string
    public name!: string
}

export class BaseUserBuilder extends Builder<BaseUser, BaseUserImpl> {
    public constructor(obj?: Readonly<BaseUser>) {
        const impl = new BaseUserImpl()
        if (obj)
            BaseUserBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public id(id: string): this {
        this.getImpl().id = id
        return this
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    protected get daa(): readonly string[] {
        return BaseUserBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'id',
        'name',
    ]
}

export function isBaseUser(value: unknown): value is BaseUser {
    return value instanceof BaseUserImpl
}

export function assertIsBaseUser(value: unknown): asserts value is BaseUser {
    if (!(value instanceof BaseUserImpl))
        throw Error('Not a BaseUser!')
}
