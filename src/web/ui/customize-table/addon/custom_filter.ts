import {Builder} from '@logi/base/ts/common/builder'
import {FormControl} from '@angular/forms'
export interface CustomSearch<T> {
    readonly searchFormControl: FormControl
    readonly filterFn: (item: T, key: string) => boolean
}

class CustomSearchImpl<T> implements CustomSearch<T> {
    public searchFormControl = new FormControl()
    public filterFn!: (item: T, key: string) => boolean
}

export class CustomSearchBuilder<T> extends Builder<CustomSearch<T>, CustomSearchImpl<T>> {
    public constructor(obj?: Readonly<CustomSearch<T>>) {
        const impl = new CustomSearchImpl<T>()
        if (obj)
            CustomSearchBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public searchFormControl(searchFormControl: FormControl): this {
        this.getImpl().searchFormControl = searchFormControl
        return this
    }

    public filterFn(filterFn: (item: T, key: string) => boolean): this {
        this.getImpl().filterFn = filterFn
        return this
    }

    protected get daa(): readonly string[] {
        return CustomSearchBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'filterFn',
    ]
}

export function isCustomSearch<T>(value: unknown): value is CustomSearch<T> {
    return value instanceof CustomSearchImpl
}

export function assertIsCustomSearch<T>(
    value: unknown
): asserts value is CustomSearch<T> {
    if (!(value instanceof CustomSearchImpl))
        throw Error('Not a CustomSearch!')
}
