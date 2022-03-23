import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {SourceType} from './base'

/**
 * Visualization on the source.
 */
export interface View {
    readonly row: string
    readonly col: string
    readonly value: number | string | undefined
    readonly type: SourceType
}

class ViewImpl implements Impl<View> {
    public row!: string
    public col!: string
    public value!: number | string | undefined
    public type!: SourceType
}

export class ViewBuilder extends Builder<View, ViewImpl> {
    public constructor(obj?: Readonly<View>) {
        const impl = new ViewImpl()
        if (obj)
            ViewBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public value(value: number | string | undefined): this {
        this.getImpl().value = value
        return this
    }

    public type(type: SourceType): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return ViewBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'row',
        'type',
    ]
}

export function isView(value: unknown): value is View {
    return value instanceof ViewImpl
}

export function assertIsView(value: unknown): asserts value is View {
    if (!(value instanceof ViewImpl))
        throw Error('Not a View!')
}
