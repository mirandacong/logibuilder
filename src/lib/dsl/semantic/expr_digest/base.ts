import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Cell} from '@logi/src/lib/dsl/semantic/cells'
import {Node as Est} from '@logi/src/lib/dsl/semantic/est'

/**
 * The digest of an expression.
 */
export interface ExprDigest {
    /**
     * The uuid of the nodes that this expression points to.
     */
    readonly fbInNodes: readonly string[]
    readonly cells: readonly Readonly<Cell>[]
    readonly est: Readonly<Est>
}

class ExprDigestImpl implements Impl<ExprDigest> {
    public fbInNodes: readonly string[] = []
    public cells: readonly Readonly<Cell>[] = []
    public est!: Readonly<Est>
}

export class ExprDigestBuilder extends Builder<ExprDigest, ExprDigestImpl> {
    public constructor(obj?: Readonly<ExprDigest>) {
        const impl = new ExprDigestImpl()
        if (obj)
            ExprDigestBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public fbInNodes(fbInNodes: readonly string[]): this {
        this.getImpl().fbInNodes = fbInNodes
        return this
    }

    public cells(cells: readonly Readonly<Cell>[]): this {
        this.getImpl().cells = cells
        return this
    }

    public est(est: Readonly<Est>): this {
        this.getImpl().est = est
        return this
    }

    protected get daa(): readonly string[] {
        return ExprDigestBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['est']
}

export function isExprDigest(value: unknown): value is ExprDigest {
    return value instanceof ExprDigestImpl
}

export function assertIsExprDigest(
    value: unknown,
): asserts value is ExprDigest {
    if (!(value instanceof ExprDigestImpl))
        throw Error('Not a ExprManager!')
}
