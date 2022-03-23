import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Sheet} from './sheet'

export interface Book {
    readonly uuid: string
    readonly sheets: readonly Sheet[]
}

class BookImpl implements Impl<Book> {
    public uuid!: string
    public sheets: readonly Sheet[] = []
}

export class BookBuilder extends Builder<Book, BookImpl> {
    public constructor(obj?: Readonly<Book>) {
        const impl = new BookImpl()
        if (obj)
            BookBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public uuid(uuid: string): this {
        this.getImpl().uuid = uuid
        return this
    }

    public sheets(sheets: readonly Sheet[]): this {
        this.getImpl().sheets = sheets
        return this
    }

    protected get daa(): readonly string[] {
        return BookBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['uuid']
}

export function isBook(value: unknown): value is Book {
    return value instanceof BookImpl
}

export function assertIsBook(value: unknown): asserts value is Book {
    if (!(value instanceof BookImpl))
        throw Error('Not a Book!')
}
