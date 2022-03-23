import {Builder} from '@logi/base/ts/common/builder'
import {SliceExpr} from '@logi/src/lib/hierarchy/core'

import {FocusType} from './enum'

/**
 * Focus interface
 */
export interface NodeFocusInfo {
    readonly nodeId: string
    readonly slice?: Readonly<SliceExpr>
    readonly focusType: FocusType
    infoEqual(info: Readonly<NodeFocusInfo>): boolean
    nodeEqual(nodeId: string, slice?: Readonly<SliceExpr>): boolean
}

class NodeFocusInfoImpl implements NodeFocusInfo {
    public nodeId!: string
    public slice?: Readonly<SliceExpr>
    public focusType: FocusType = FocusType.CONTAINER
    public infoEqual(info: Readonly<NodeFocusInfo>): boolean {
        return info.nodeId === this.nodeId
            && info.slice?.uuid === this.slice?.uuid
            && info.focusType === this.focusType
    }

    public nodeEqual(
        nodeId: string,
        slice?: Readonly<SliceExpr>,
        type: FocusType = FocusType.CONTAINER,
    ): boolean {
        return nodeId === this.nodeId
            && slice?.uuid === this.slice?.uuid
            && type === this.focusType
    }
}

export class NodeFocusInfoBuilder extends
    Builder<NodeFocusInfo, NodeFocusInfoImpl> {
    public constructor(obj?: Readonly<NodeFocusInfo>) {
        const impl = new NodeFocusInfoImpl()
        if (obj)
            NodeFocusInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public nodeId(nodeId: string): this {
        this.getImpl().nodeId = nodeId
        return this
    }

    public slice(slice?: Readonly<SliceExpr>): this {
        this.getImpl().slice = slice
        return this
    }

    public focusType(focusType: FocusType): this {
        this.getImpl().focusType = focusType
        return this
    }

    protected get daa(): readonly string[] {
        return NodeFocusInfoBuilder.__DAA_PROPS__
    }
    protected static __DAA_PROPS__: readonly string[] = [
        'nodeId',
    ]
}
