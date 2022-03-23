import {AbstractControl, ValidationErrors} from '@angular/forms'

import {
    BaseDialogData,
    BaseDialogDataBuilder,
    BaseDialogDataImpl,
} from './base_dialog_data'
export interface ValidatorItem {
    readonly message: string
    // tslint:disable-next-line: prefer-method-signature
    readonly validator: (control: AbstractControl) => ValidationErrors | null
}

export interface ValidatorRules {
    // tslint:disable-next-line: no-indexable-types
    readonly [key: string]: ValidatorItem
}

export interface InputDialogData extends BaseDialogData {
    readonly rules?: ValidatorRules
    /**
     * input内容的描述信息,例如:"模板名称:"
     */
    readonly label?: string
    readonly value?: string
    readonly placeholder?: string
}

class InputDialogDataImpl extends BaseDialogDataImpl
    implements InputDialogData {
    public rules?: ValidatorRules
    public value = ''
    public label?: string
    public placeholder = ''
}

export class InputDialogDataBuilder extends
    BaseDialogDataBuilder<InputDialogData, InputDialogDataImpl> {
    public constructor(obj?: Readonly<InputDialogData>) {
        const impl = new InputDialogDataImpl()
        if (obj)
            InputDialogDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public rules(rules: ValidatorRules): this {
        this.getImpl().rules = rules
        return this
    }

    public value(value: string): this {
        this.getImpl().value = value
        return this
    }

    public label(value: string): this {
        this.getImpl().label = value
        return this
    }

    public placeholder(placeholder: string): this {
        this.getImpl().placeholder = placeholder
        return this
    }

    protected get daa(): readonly string[] {
        return InputDialogDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['title']
}

export function isInputDialogData(value: unknown): value is InputDialogData {
    return value instanceof InputDialogDataImpl
}

export function assertIsInputDialogData(
    value: unknown,
): asserts value is InputDialogData {
    if (!(value instanceof InputDialogDataImpl))
        throw Error('Not a InputDialogData!')
}
