/* eslint-disable @typescript-eslint/no-explicit-any */
import {Builder} from '@logi/base/ts/common/builder'
import {FormControl} from '@angular/forms'

export type OptionLabelFn<T> = (option: T) => string

export interface Filter<T = any>{
    readonly formControl: FormControl
    readonly options: readonly T[]
    readonly title: string
    updateOptions(value: readonly T[]): void
    initFormControl(option: T): void

    readonly optionLabelFn?: OptionLabelFn<T>

}

class FilterImpl<T> implements Filter<T> {
    public formControl: FormControl = new FormControl()
    public options: readonly T[] = []
    public title!: string
    public optionLabelFn?: OptionLabelFn<T>
    updateOptions(value: readonly T[]): void{
        this.options = value
    }

    initFormControl(option: T): void{
        this.formControl.setValue(option)
    }
}

export class FilterBuilder<T> extends Builder<Filter<T>, FilterImpl<T>> {
    public constructor(obj?: Readonly<Filter<T>>) {
        const impl = new FilterImpl<T>()
        if (obj)
            FilterBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public options(options: readonly any[]): this {
        this.getImpl().options = options
        return this
    }

    public title(title: string): this {
        this.getImpl().title = title
        return this
    }

    public optionLabelFn(optionLabelFn: OptionLabelFn<T>): this {
        this.getImpl().optionLabelFn = optionLabelFn
        return this
    }

    protected get daa(): readonly string[] {
        return FilterBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'formControl',
        'title',
    ]
}

export function isFilter<T>(value: unknown): value is Filter<T> {
    return value instanceof FilterImpl
}

export function assertIsFilter<T>(value: unknown): asserts value is Filter<T> {
    if (!(value instanceof FilterImpl))
        throw Error('Not a Filter!')
}
