import {AbstractControl} from '@angular/forms'
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
export interface Form {
    readonly label: string
    readonly required: boolean
    readonly formControlName: string
    readonly placeholder: string
}

class FormImpl implements Impl<Form> {
    public label!: string
    public required!: boolean
    public formControlName!: string
    public placeholder!: string
    public control!: AbstractControl
}

export class FormBuilder extends Builder<Form, FormImpl> {
    public constructor(obj?: Readonly<Form>) {
        const impl = new FormImpl()
        if (obj)
            FormBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public label(label: string): this {
        this.getImpl().label = label
        return this
    }

    public required(required: boolean): this {
        this.getImpl().required = required
        return this
    }

    public formControlName(formControlName: string): this {
        this.getImpl().formControlName = formControlName
        return this
    }

    public placeholder(placeholder: string): this {
        this.getImpl().placeholder = placeholder
        return this
    }

    protected get daa(): readonly string[] {
        return FormBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'label',
        'required',
        'formControlName',
        'placeholder',
    ]
}

export function isForm(value: unknown): value is Form {
    return value instanceof FormImpl
}

export function assertIsForm(value: unknown): asserts value is Form {
    if (!(value instanceof FormImpl))
        throw Error('Not a Form!')
}
