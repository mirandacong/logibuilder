import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ResolvedNode} from '@logi/src/lib/intellisense/utils'

import {ViewPart} from './part'

export interface PanelItem {
    readonly parts: readonly ViewPart[]
    readonly resolvedNode?: ResolvedNode
}

class PanelItemImpl implements Impl<PanelItem> {
    public parts: readonly ViewPart[] = []
    public resolvedNode?: ResolvedNode
}

export class PanelItemBuilder extends Builder<PanelItem, PanelItemImpl> {
    public constructor(obj?: Readonly<PanelItem>) {
        const impl = new PanelItemImpl()
        if (obj)
            PanelItemBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public parts(parts: readonly ViewPart[]): this {
        this.getImpl().parts = parts
        return this
    }

    public resolvedNode(resolvedNode: ResolvedNode): this {
        this.getImpl().resolvedNode = resolvedNode
        return this
    }

    protected get daa(): readonly string[] {
        return PanelItemBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'parts',
    ]
}

export function isPanelItem(obj: unknown): obj is PanelItem {
    return obj instanceof PanelItemImpl
}

export interface PanelTab {
    readonly items: readonly PanelItem[]
    readonly selected: number
}

class PanelTabImpl implements Impl<PanelTab> {
    public items: readonly PanelItem[] = []
    public selected!: number
}

export class PanelTabBuilder extends Builder<PanelTab, PanelTabImpl> {
    public constructor(obj?: Readonly<PanelTab>) {
        const impl = new PanelTabImpl()
        if (obj)
            PanelTabBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public items(items: readonly PanelItem[]): this {
        this.getImpl().items = items
        return this
    }

    public selected(selected: number): this {
        this.getImpl().selected = selected
        return this
    }
}

export function isPanelTab(obj: unknown): obj is PanelTab {
    return obj instanceof PanelTabImpl
}

/**
 * The response that informs the frontend to show or hide the panel.
 */
export interface PanelResponse {
    readonly tab: PanelTab
}

class PanelResponseImpl implements Impl<PanelResponse> {
    public tab!: PanelTab
}

// tslint:disable-next-line: max-classes-per-file
export class PanelResponseBuilder extends
    Builder<PanelResponse, PanelResponseImpl> {
    public constructor(obj?: Readonly<PanelResponse>) {
        const impl = new PanelResponseImpl()
        if (obj)
            PanelResponseBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public tab(tab: PanelTab): this {
        this.getImpl().tab = tab
        return this
    }

    protected get daa(): readonly string[] {
        return PanelResponseBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['tab']
}

export function isPanelResponse(obj: unknown): obj is PanelResponse {
    return obj instanceof PanelResponseImpl
}
