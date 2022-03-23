import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Result} from '../base'

export interface ClipboardResult extends Result {
    readonly actionType: number
    readonly cutNodes: readonly string[]
}

class ClipboardResultImpl implements Impl<ClipboardResult> {
    public actionType!: number
    public cutNodes: readonly string[] = []
}

export class ClipboardResultBuilder
    extends Builder<ClipboardResult, ClipboardResultImpl> {
    public constructor(obj?: Readonly<ClipboardResult>) {
        const impl = new ClipboardResultImpl()
        if (obj)
            ClipboardResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public actionType(actionType: number): this {
        this.getImpl().actionType = actionType
        return this
    }

    public cutNodes(cutNodes: readonly string[]): this {
        this.getImpl().cutNodes = cutNodes
        return this
    }

    protected get daa(): readonly string[] {
        return ClipboardResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['actionType']
}
