// tslint:disable: unknown-instead-of-any
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {Operator} from './operate_enum'
export interface ExcelOperator {
    readonly operator: Operator,
    readonly value: any,
}

class ExcelOperatorImpl implements Impl<ExcelOperator> {
    public operator!: Operator
    public value!: any
}

export class ExcelOperatorBuilder
    extends Builder<ExcelOperator, ExcelOperatorImpl> {
    public constructor(obj?: Readonly<ExcelOperator>) {
        const impl = new ExcelOperatorImpl()
        if (obj)
            ExcelOperatorBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public operator(operator: Operator): this {
        this.getImpl().operator = operator
        return this
    }

    public value(value: any): this {
        this.getImpl().value = value
        return this
    }

    protected get daa(): readonly string[] {
        return ExcelOperatorBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['operator']
}
export function isExcelOperator(value: unknown): value is ExcelOperator {
    return value instanceof ExcelOperatorImpl
}

export function assertIsExcelOperator(value: unknown):
    asserts value is ExcelOperator {
    if (!(value instanceof ExcelOperatorImpl))
        throw Error('Not a ExcelOperator!')
}
