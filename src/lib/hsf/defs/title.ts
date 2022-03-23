import {Impl} from '@logi/base/ts/common/mapped_types'

import {Block, BlockImpl, BlockType} from './block'
import {BaseBlockBuilder} from './lib'

export interface Title extends Block {
    /**
     * Depth means the steps from the hierarchy sheet node to this title node.
     * The lowest depth is 1.
     */
    readonly depth: number
}

class TitleImpl extends BlockImpl implements Impl<Title> {
    public type = BlockType.TITLE
    public depth!: number
}

export class TitleBuilder extends BaseBlockBuilder<Title, TitleImpl> {
    public constructor(obj?: Readonly<Title | Block>) {
        const impl = new TitleImpl()
        super(impl)
        if (obj === undefined)
            return
        if (obj instanceof TitleImpl)
            TitleBuilder.shallowCopy(impl, obj)
        else
            TitleBuilder.shallowCopy(impl, obj)
    }

    public depth(depth: number): this {
        this.getImpl().depth = depth
        return this
    }

    protected get daa(): readonly string[] {
        return TitleBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['depth']
}

export function isTitle(value: unknown): value is Title {
    return value instanceof TitleImpl
}

export function assertIsTitle(value: unknown): asserts value is Title {
    if (!(value instanceof TitleImpl))
        throw Error('Not a Title!')
}
