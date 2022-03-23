import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {PanelItem} from '@logi/src/lib/intellisense'

export interface PanelData {
    readonly offset: number
    readonly items: readonly PanelItem[]
    readonly selectedIndex: number
}

class PanelDataImpl implements Impl<PanelData> {
    public offset!: number
    public items: readonly PanelItem[] = []
    public selectedIndex = 0
}

export class PanelDataBuilder extends Builder<PanelData, PanelDataImpl> {
    public constructor(obj?: Readonly<PanelData>) {
        const impl = new PanelDataImpl()
        if (obj)
            PanelDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public offset(offset: number): this {
        this.getImpl().offset = offset
        return this
    }

    public items(items: readonly PanelItem[]): this {
        this.getImpl().items = items
        return this
    }

    public selectedIndex(i: number): this {
        this.getImpl().selectedIndex = i
        return this
    }

    protected get daa(): readonly string[] {
        return PanelDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'items',
        'offset',
    ]
}

export function isPanelData(obj: unknown): obj is PanelData {
    return obj instanceof PanelDataImpl
}
