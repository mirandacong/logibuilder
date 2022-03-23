import {Builder} from '@logi/base/ts/common/builder'

// tslint:disable: unknown-instead-of-any
export interface CascadedSelectOption {
    readonly label: string
    readonly value: any
    readonly disabled: boolean
    readonly isLeaf: boolean
    readonly parent: CascadedSelectOption | null
    readonly children: readonly CascadedSelectOption[]
    updateChildren(children: readonly CascadedSelectOption[]): void
}

class CascadedSelectOptionImpl implements CascadedSelectOption {
    public set label(l: string) {
        this._label = l
    }

    public get label(): string {
        if (this._label.trim().length === 0)
            return String(this.value)
        return this._label
    }
    public value!: any
    public disabled = false
    public get isLeaf(): boolean {
        return this.children.length === 0
    }
    // tslint:disable-next-line: no-null-keyword
    public parent: CascadedSelectOption | null = null
    public children: readonly CascadedSelectOption[] = []

    public updateChildren(children: readonly CascadedSelectOption[]): void {
        this.children = children
    }
    private _label = ''
}

export class CascadedSelectOptionBuilder extends
Builder<CascadedSelectOption, CascadedSelectOptionImpl> {
    public constructor(obj?: Readonly<CascadedSelectOption>) {
        const impl = new CascadedSelectOptionImpl()
        if (obj)
            CascadedSelectOptionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public label(label: string): this {
        this.getImpl().label = label
        return this
    }

    public value(value: any): this {
        this.getImpl().value = value
        return this
    }

    public disabled(disabled: boolean): this {
        this.getImpl().disabled = disabled
        return this
    }

    public children(children: readonly CascadedSelectOption[]): this {
        this.getImpl().children = children
        return this
    }

    protected get daa(): readonly string[] {
        return CascadedSelectOptionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'value',
    ]
}

export function isCascadedSelectOption(
    value: unknown,
): value is CascadedSelectOption {
    return value instanceof CascadedSelectOptionImpl
}

export function assertIsCascadedSelectOption(
    value: unknown,
): asserts value is CascadedSelectOption {
    if (!(value instanceof CascadedSelectOptionImpl))
        throw Error('Not a CascadedSelectOption!')
}

export function isGroupOption(o: CascadedSelectOption): boolean {
    return o.children.length > 0
}
