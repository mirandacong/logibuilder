import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node, NodeType} from '@logi/src/lib/hierarchy/core'

// tslint:disable-next-line: comment-for-export-and-public
export interface AddNode {
    readonly parent: Readonly<Node>
    readonly addType: NodeType
    readonly index?: number
}

class AddNodeImpl implements Impl<AddNode> {
    public parent!: Readonly<Node>
    public addType!: NodeType
    public index?: number
}

export class AddNodeBuilder extends Builder<AddNode, AddNodeImpl> {
    public constructor(obj?: Readonly<AddNode>) {
        const impl = new AddNodeImpl()
        if (obj)
            AddNodeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public parent(parent: Readonly<Node>): this {
        this.getImpl().parent = parent
        return this
    }

    public addType(addType: NodeType): this {
        this.getImpl().addType = addType
        return this
    }

    public index(index: number): this {
        this.getImpl().index = index
        return this
    }

    protected get daa(): readonly string[] {
        return AddNodeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['parent', 'addType']
}

export function isAddNode(value: unknown): value is AddNode {
    return value instanceof AddNodeImpl
}

export function assertIsAddNode(value: unknown): asserts value is AddNode {
    if (!(value instanceof AddNodeImpl))
        throw Error('Not a AddNode!')
}
