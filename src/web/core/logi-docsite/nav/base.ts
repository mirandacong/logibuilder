import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface NavBase {
    readonly title: string
}

export class NavBaseImpl implements Impl<NavBase> {
    public title = ''
}

export class NavBaseBuilder<T extends NavBase, S extends Impl<T>>
extends Builder<T, S> {
    public title(title: string): this {
        this.getImpl().title = title
        return this
    }
}
