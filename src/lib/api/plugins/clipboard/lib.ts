import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

/**
 * There can only be one one of nodes and slices in clipboard.
 * If one of them is set, the other will be cleared.
 */
/**
 * TODO(zecheng): Store uuid of not but not node.
 */
export interface Clipboard {
    readonly nodes: readonly string[]
    readonly isCut: boolean
    readonly slices: readonly string[]

    setNodes(nodes: readonly string[], isCut: boolean): void
    getNodes(): readonly string[]
    setSlices(slice: readonly string[], isCut: boolean): void
    getSlices(): readonly string[]
    isEmpty(): boolean
    clear(): void
}

class ClipboardImpl implements Impl<Clipboard> {
    public nodes: readonly string[] = []
    public slices: readonly string[] = []

    public isCut = false

    public setNodes(nodes: readonly string[], isCut: boolean): void {
        this.nodes = nodes
        this.isCut = isCut
        this.slices = []
    }

    public getNodes(): readonly string[] {
        const res = this.nodes
        if (this.isCut)
            this.nodes = []
        return res
    }

    public setSlices(slices: readonly string[], isCut: boolean): void {
        this.isCut = isCut
        this.nodes = []
        this.slices = slices
    }

    public getSlices(): readonly string[] {
        const result = this.slices
        if (this.isCut)
            this.slices = []
        return result
    }

    public isEmpty(): boolean {
        return this.nodes.length === 0 && this.slices.length === 0
    }

    public clear(): void {
        this.nodes = []
        this.slices = []
        this.isCut = false
    }
}

export class ClipboardBuilder extends Builder<Clipboard, ClipboardImpl> {
    public constructor(obj?: Readonly<Clipboard>) {
        const impl = new ClipboardImpl()
        if (obj)
            ClipboardBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isClipboard(value: unknown): value is Clipboard {
    return value instanceof ClipboardImpl
}

export function assertIsClipboard(value: unknown): asserts value is Clipboard {
    if (!(value instanceof ClipboardImpl))
        throw Error('Not a Clipboard!')
}
