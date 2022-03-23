import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface Node {
    /**
     * The phrase referenced to this node.
     */
    readonly phrase: string

    /**
     * The weight of the recommendation provided by this node.
     */
    readonly weight: number

    /**
     * The destinations and the probabilities of choosing this destination.
     */
    readonly edges: readonly Edge[]
}

/**
 * Edge is only used in Node. An edge contains a destination and probability.
 *
 * It means that if this node is given to recommend phrases,
 * the destination is an option.
 * Probability tells us how much this destination should be trust.
 */
export class Edge {
    public constructor(public readonly destination: number,
        public readonly probability: number) {}
}

export class NodeBuilder extends Builder<Node, NodeImpl> {
    public constructor(obj?: Readonly<Node>) {
        const impl = new NodeImpl()
        if (obj)
            NodeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public phrase(phrase: string): NodeBuilder {
        this.getImpl().phrase = phrase

        return this
    }

    public weight(weight: number): NodeBuilder {
        this.getImpl().weight = weight

        return this
    }

    public edges(edges: readonly Edge[]): NodeBuilder {
        this.getImpl().edges = edges

        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['phrase']

    protected get daa(): readonly string[] {
        return NodeBuilder.__DAA_PROPS__
    }
}

class NodeImpl implements Impl<Node> {
    public phrase!: string
    public weight = 1
    public edges: readonly Edge[] = []
}
