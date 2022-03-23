import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export function contentList(): readonly Legend[] {
    return [
        new LegendBuilder()
            .color('#707070')
            .explain('源数据')
            .example('1.00')
            .build(),
        new LegendBuilder()
            .color('#13AC59')
            .explain('直接引用')
            .example('1.00')
            .build(),
        new LegendBuilder()
            .color('#4178B8')
            .explain('用户输入')
            .example('1.00')
            .build(),
        new LegendBuilder()
            .color('#000000')
            .explain('本工作表公式')
            .example('1.00')
            .build(),
        new LegendBuilder()
            .color('#8800CC')
            .explain('跨工作表公式')
            .example('1.00')
            .build(),
    ]
}

export function backgroundList(): readonly Legend[] {
    return [
        new LegendBuilder().explain('事实数据（可输入）').color('facts').build(),
        new LegendBuilder().explain('假设数据（可输入）').color('assumption').build(),
        new LegendBuilder().explain('标量数据').color('scalar').build(),
    ]
}

export interface Legend {
    readonly color: string,
    readonly explain: string,
    readonly example?: string,
}

class LegendImpl implements Impl<Legend> {
    public color!: string
    public explain!: string
    public example?: string
}

export class LegendBuilder extends Builder<Legend, LegendImpl> {
    public constructor(obj?: Readonly<Legend>) {
        const impl = new LegendImpl()
        if (obj)
            LegendBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public color(color: string): this {
        this.getImpl().color = color
        return this
    }

    public explain(explain: string): this {
        this.getImpl().explain = explain
        return this
    }

    public example(example: string): this {
        this.getImpl().example = example
        return this
    }

    protected get daa(): readonly string[] {
        return LegendBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['explain']
}

export function isLegend(value: unknown): value is Legend {
    return value instanceof LegendImpl
}

export function assertIsLegend(value: unknown): asserts value is Legend {
    if (!(value instanceof LegendImpl))
        throw Error('Not a Legend!')
}
