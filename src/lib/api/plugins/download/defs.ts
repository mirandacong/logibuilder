import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ModifierPlugin} from '@logi/src/lib/api/plugins/modifier'

import {Plugin as BookPlugin} from '../book/plugin'
import {Plugin as FormulaPlugin} from '../formula/plugin'
import {Plugin as HsfPlugin} from '../hsf/plugin'
import {Plugin as SourcePlugin} from '../source/plugin'
import {Plugin as StdHeaderPlugin} from '../std_header/plugin'
import {Plugin as WorkbookPlugin} from '../workbook/plugin'

/**
 * Help to deliver the plugin data.
 */
export interface Data {
    readonly book: BookPlugin
    readonly src: SourcePlugin
    readonly formula: FormulaPlugin
    readonly modifier: ModifierPlugin
    readonly hsf: HsfPlugin
    readonly workbook: WorkbookPlugin
    readonly tmpl: StdHeaderPlugin
}

class DataImpl implements Impl<Data> {
    public book!: BookPlugin
    public src!: SourcePlugin
    public formula!: FormulaPlugin
    public modifier!: ModifierPlugin
    public hsf!: HsfPlugin
    public workbook!: WorkbookPlugin
    public tmpl!: StdHeaderPlugin
}

export class DataBuilder extends Builder<Data, DataImpl> {
    public constructor(obj?: Readonly<Data>) {
        const impl = new DataImpl()
        if (obj)
            DataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public book(book: BookPlugin): this {
        this.getImpl().book = book
        return this
    }

    public src(src: SourcePlugin): this {
        this.getImpl().src = src
        return this
    }

    public formula(formula: FormulaPlugin): this {
        this.getImpl().formula = formula
        return this
    }

    public modifier(modifier: ModifierPlugin): this {
        this.getImpl().modifier = modifier
        return this
    }

    public hsf(hsf: HsfPlugin): this {
        this.getImpl().hsf = hsf
        return this
    }

    public workbook(workbook: WorkbookPlugin): this {
        this.getImpl().workbook = workbook
        return this
    }

    public tmpl(tmpl: StdHeaderPlugin): this {
        this.getImpl().tmpl = tmpl
        return this
    }

    protected get daa(): readonly string[] {
        return DataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'book',
        'src',
        'formula',
        'modifier',
        'hsf',
        'workbook',
        'tmpl',
    ]
}
