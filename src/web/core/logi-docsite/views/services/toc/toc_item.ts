import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface TocItem {
    readonly href: string
    readonly level: string
    readonly title: string
}

class TocItemImpl implements Impl<TocItem> {
    public href = ''
    public level = ''
    public title = ''
}

export class TocItemBuilder extends Builder<TocItem, TocItemImpl> {
    public constructor(obj?: Readonly<TocItem>) {
        const impl = new TocItemImpl()
        if (obj)
            TocItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public href(href: string): this {
        this.getImpl().href = href
        return this
    }

    public level(level: string): this {
        this.getImpl().level = level
        return this
    }

    public title(title: string): this {
        this.getImpl().title = title
        return this
    }
}
