import {Nav, NavImpl, BaseNavBuilder} from './nav'

export interface RouterNav extends Nav {
    readonly route: string
    /**
     * TODO(biao): find another way
     */
    readonly relative: boolean
}

class RouterNavImpl extends NavImpl implements RouterNav {
    public route!: string
    public relative = false
}

export class RouterNavBuilder extends BaseNavBuilder<RouterNav, RouterNavImpl> {
    public constructor(obj?: Readonly<RouterNav>) {
        const impl = new RouterNavImpl()
        if (obj)
            RouterNavBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public route(route: string): this {
        this.getImpl().route = route
        return this
    }

    public relative(relative: boolean): this {
        this.getImpl().relative = relative
        return this
    }

    protected get daa(): readonly string[] {
        return RouterNavBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        ...BaseNavBuilder.__DAA_PROPS__,
        'route',
    ]

}

export function isRouterNav(value: unknown): value is RouterNav {
    return value instanceof RouterNavImpl
}

export function assertIsRouterNav(value: unknown): asserts value is RouterNav {
    if (!(value instanceof RouterNavImpl))
        throw Error('Not a RouteNav!')
}
