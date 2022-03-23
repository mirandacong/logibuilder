import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Book} from '@logi/src/lib/hierarchy/core'

import {Result} from '../base'

export interface BookResult extends Result {
    readonly actionType: number
    readonly book: Readonly<Book>
}

class BookResultImpl implements Impl<BookResult> {
    public actionType!: number
    public book!: Readonly<Book>
}

export class BookResultBuilder extends Builder<BookResult, BookResultImpl> {
    public constructor(obj?: Readonly<BookResult>) {
        const impl = new BookResultImpl()
        if (obj)
            BookResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public book(book: Readonly<Book>): this {
        this.getImpl().book = book
        return this
    }

    protected get daa(): readonly string[] {
        return BookResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'actionType',
        'book',
    ]
}

export function isBookResult(value: unknown): value is BookResult {
    return value instanceof BookResultImpl
}

export function assertIsBookResult(
    value: unknown,
): asserts value is BookResult {
    if (!(value instanceof BookResultImpl))
        throw Error('Not a BookResult!')
}
