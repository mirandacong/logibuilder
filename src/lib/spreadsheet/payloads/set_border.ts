import {LineType} from '@logi/base/ts/common/excel'

import {Builder, CellRange, RangePayload} from './range'

export const enum BorderPosition {
    ALL,
    LEFT,
    TOP,
    RIGHT,
    BOTTOM,
    OUTLINE,
    INSIDE,
    INNER_HORIZONTAL,
    INNER_VERTICAL,
    DIAGONAL_UP,
    DIAGONAL_DOWN,
}

export interface SetBorderPayload extends RangePayload {
    readonly range: CellRange
    readonly position: BorderPosition
    readonly line: LineType
    readonly color: string
}

class SetBorderPayloadImpl
    extends RangePayload implements SetBorderPayload {
    public range!: CellRange
    public position!: BorderPosition
    public line!: LineType
    public color!: string
}

export class SetBorderPayloadBuilder
    extends Builder<SetBorderPayload, SetBorderPayloadImpl> {
    public constructor(obj?: Readonly<SetBorderPayload>) {
        const impl = new SetBorderPayloadImpl()
        if (obj)
            SetBorderPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public range(range: CellRange): this {
        this.getImpl().range = range
        return this
    }

    public position(position: BorderPosition): this {
        this.getImpl().position = position
        return this
    }

    public line(line: LineType): this {
        this.getImpl().line = line
        return this
    }

    public color(color: string): this {
        this.getImpl().color = color
        return this
    }

    protected get daa(): readonly string[] {
        return SetBorderPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'range',
        'position',
        'line',
        'color',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetBorderPayload(value: unknown): value is SetBorderPayload {
    return value instanceof SetBorderPayloadImpl
}
