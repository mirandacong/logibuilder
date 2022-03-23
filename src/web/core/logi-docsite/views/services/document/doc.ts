import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
export interface Doc {
    /**
     * Url of a document.
     */
    readonly id: string,

    /**
     * Html string content of a document.
     */
    readonly content: string,
}

class DocImpl implements Impl<Doc> {
    public id!: string
    public content!: string
}

export class DocBuilder extends Builder<Doc, DocImpl> {
    public constructor(obj?: Readonly<Doc>) {
        const impl = new DocImpl()
        if (obj)
            DocBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public id(id: string): this {
        this.getImpl().id = id
        return this
    }

    public content(content: string): this {
        this.getImpl().content = content
        return this
    }
}
