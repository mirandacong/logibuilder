import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Nav {
    readonly name: string
    readonly id: number
    readonly disable: boolean
    readonly icon: string
    updateDisable(disable: boolean): void
}

export class NavImpl implements Impl<Nav> {
    public name!: string
    public id!: number
    public disable = false
    public icon = ''
    public updateDisable(disable: boolean): void {
        this.disable = disable
    }
}
export class BaseNavBuilder<T extends NavImpl, S extends Impl<T>>
    extends Builder<T, S> {
    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public id(id: number): this {
        this.getImpl().id = id
        return this
    }

    public disable(disable: boolean): this {
        this.getImpl().disable = disable
        return this
    }

    public icon(icon: string): this {
        this.getImpl().icon = icon
        return this
    }

    protected get daa(): readonly string[] {
        return BaseNavBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'id',
    ]

}

export class NavBuilder extends BaseNavBuilder<Nav, NavImpl> {
    public constructor(obj?: Readonly<Nav>) {
        const impl = new NavImpl()
        if (obj)
            NavBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    protected get daa(): readonly string[] {
        return NavBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...BaseNavBuilder.__DAA_PROPS__,
    ]

}

export function isNav(value: unknown): value is Nav {
    return value instanceof NavImpl
}

export function assertIsNav(value: unknown): asserts value is Nav {
    if (!(value instanceof NavImpl))
        throw Error('Not a Nav!')
}
