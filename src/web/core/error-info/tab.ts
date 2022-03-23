import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ErrorInfo} from '@logi/src/lib/api'
export interface Tab {
    readonly name: string
    readonly count: number
    readonly errors: readonly ErrorInfo[]
    label(): string
}

class TabImpl implements Impl<Tab> {
    public name!: string
    public count = 0
    public errors: readonly ErrorInfo[] = []
    public label(): string {
        return `${this.name} (${this.count})`
    }
}

export class TabBuilder extends Builder<Tab, TabImpl> {
    public constructor(obj?: Readonly<Tab>) {
        const impl = new TabImpl()
        if (obj)
            TabBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public count(count: number): this {
        this.getImpl().count = count
        return this
    }

    public errors(errors: readonly ErrorInfo[]): this {
        this.getImpl().errors = errors
        return this
    }

    protected get daa(): readonly string[] {
        return TabBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
    ]
}

export function isTab(value: unknown): value is Tab {
    return value instanceof TabImpl
}

export function assertIsTab(value: unknown): asserts value is Tab {
    if (!(value instanceof TabImpl))
        throw Error('Not a Tab!')
}
