import {OverlayRef} from '@angular/cdk/overlay'
import {Builder} from '@logi/base/ts/common/builder'

// tslint:disable: unknown-instead-of-any
export interface ContextMenuOverlay {
    readonly overlayRef: OverlayRef,
    readonly parent?: ContextMenuOverlay,
    readonly wasLeaf: boolean
    readonly bindingComponent: any
    updateWasLeaf(wasLeaf: boolean): void
}

class ContextMenuOverlayImpl implements ContextMenuOverlay {
    public overlayRef!: OverlayRef
    public parent?: ContextMenuOverlay
    public wasLeaf = false
    public bindingComponent!: any
    public updateWasLeaf(wasLeaf: boolean): void {
        this.wasLeaf = wasLeaf
    }
}

export class ContextMenuOverlayBuilder
extends Builder<ContextMenuOverlay, ContextMenuOverlayImpl> {
    public constructor(obj?: Readonly<ContextMenuOverlay>) {
        const impl = new ContextMenuOverlayImpl()
        if (obj)
            ContextMenuOverlayBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public overlayRef(overlayRef: OverlayRef): this {
        this.getImpl().overlayRef = overlayRef
        return this
    }

    public parent(parent: ContextMenuOverlay): this {
        this.getImpl().parent = parent
        return this
    }

    public wasLeaf(wasLeaf: boolean): this {
        this.getImpl().wasLeaf = wasLeaf
        return this
    }

    public bindingComponent(bindingComponent: any): this {
        this.getImpl().bindingComponent = bindingComponent
        return this
    }

    protected get daa(): readonly string[] {
        return ContextMenuOverlayBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'overlayRef',
        'bindingComponent',
    ]
}

export function isContextMenuOverlay(
    value: unknown,
): value is ContextMenuOverlay {
    return value instanceof ContextMenuOverlayImpl
}

export function assertIsContextMenuOverlay(
    value: unknown,
): asserts value is ContextMenuOverlay {
    if (!(value instanceof ContextMenuOverlayImpl))
        throw Error('Not a ContextMenuOverlay!')
}
