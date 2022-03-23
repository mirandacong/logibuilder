import {Builder} from '@logi/base/ts/common/builder'
import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'

/**
 * A replacement of nodes of a hierarchy tree.
 */
export interface Replacement {
    readonly original: Readonly<Node>
    readonly substitute: Readonly<Node>
    validate(): void | Exception

}

class ReplacementImpl implements Impl<Replacement> {
    public original!: Readonly<Node>
    public substitute!: Readonly<Node>
    public validate(): void | Exception {
        if (this.original.nodetype === this.substitute.nodetype)
            return
        return new ExceptionBuilder()
            .message('The replacement of the 2 nodes are not the same type.')
            .build()
    }
}

export class ReplacementBuilder extends Builder<Replacement, ReplacementImpl> {
    public constructor(obj?: Readonly<Replacement>) {
        const impl = new ReplacementImpl()
        if (obj)
            ReplacementBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public original(original: Readonly<Node>): this {
        this.getImpl().original = original
        return this
    }

    public substitute(substitute: Readonly<Node>): this {
        this.getImpl().substitute = substitute
        return this
    }

    protected get daa(): readonly string[] {
        return ReplacementBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'original',
        'substitute',
    ]
}
