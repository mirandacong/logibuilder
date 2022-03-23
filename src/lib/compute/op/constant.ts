import {Impl} from '@logi/base/ts/common/mapped_types'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'
import {sprintf} from 'sprintf-js'

import {Builder} from './base'
import {KeyWord} from './keyword'
import {Op, OpType} from './node'

interface ConstantOp extends Op {
    readonly value: t.mixed
}

export class ConstantOpBuilder extends Builder<ConstantOp, ConstantOpImpl> {
    public constructor(obj?: Readonly<ConstantOp>) {
        const impl = new ConstantOpImpl()
        if (obj)
            ConstantOpBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    protected get daa(): readonly string[] {
        return [...Builder.__DAA_PROPS__, 'value']
    }

    public value(value: t.mixed): this {
        this._getImpl().value = value

        return this
    }
}

/**
 * Safe to use definite assignment assertions because the builder class,
 * ConstantOpBuilder mandatorily verifies them.
 */
class ConstantOpImpl implements Impl<ConstantOp> {
    public get optype(): OpType {
        return ConstantOpImpl.__OPTYPE__
    }

    public name?: string
    public inTypes: readonly t.Mixed[] = []
    public outType?: t.Mixed

    public value: t.mixed

    // @ts-ignore: Unused parameter.
    // tslint:disable-next-line: no-unused
    public evaluate(...args: readonly unknown[]): unknown {
        return this.value
    }

    public excelFormula(): string {
        const value = String(this.value)
        if (value === KeyWord.NULL)
            return sprintf('""')
        // The format used in sprintf is explained here:
        //      https://github.com/alexei/sprintf.js
        return sprintf('%s', value)
    }
    private static readonly __OPTYPE__: OpType = OpType.CONSTANT
}
