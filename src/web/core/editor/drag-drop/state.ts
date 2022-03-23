import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {NodeType} from '@logi/src/lib/hierarchy/core'

import {DropEffect, EffectAllowed} from './types'

/**
 * State of an draggable element.
 */
export interface DndState {
    readonly isDragging: boolean
    readonly dropEffect: DropEffect
    readonly effectAllowed: EffectAllowed
    readonly types: readonly string[]
}

class DndStateImpl implements Impl<DndState> {
    public isDragging = false
    public dropEffect: DropEffect = 'none'
    public effectAllowed: EffectAllowed = 'all'
    public types: readonly string[] = [NodeType.TYPE_UNSPECIFIED.toString()]
}

export class DndStateBuilder extends Builder<DndState, DndStateImpl> {
    public constructor(obj?: Readonly<DndState>) {
        const impl = new DndStateImpl()
        if (obj)
            DndStateBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public isDragging(isDragging: boolean): this {
        this.getImpl().isDragging = isDragging
        return this
    }

    public dropEffect(dropEffect: DropEffect): this {
        this.getImpl().dropEffect = dropEffect
        return this
    }

    public effectAllowed(effectAllowed: EffectAllowed): this {
        this.getImpl().effectAllowed = effectAllowed
        return this
    }

    public types(types: readonly string[]): this {
        this.getImpl().types = types
        return this
    }
}

export function isDndState(obj: unknown): obj is DndState {
    return obj instanceof DndStateImpl
}
