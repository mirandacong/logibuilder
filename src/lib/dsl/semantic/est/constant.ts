import {DatetimeDelta} from '@logi/base/ts/common/datetime'
import {ConstantOpBuilder, KeyWord} from '@logi/src/lib/compute/op'
// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {
    FormulaInfo,
    FormulaInfoBuilder,
    HEADLESS,
    Node,
    SubFormulaInfo,
    Type,
} from './node'

export class Constant extends Node {
    public constructor(
        public readonly value: number | string | DatetimeDelta | KeyWord,
        public readonly image: string,
    ) {
        super([])
    }
    public readonly type = Type.CONSTANT
    public children: readonly Readonly<Node>[] = []
    protected validateRules: readonly never[] = []

    protected buildFormulaInfo(): readonly FormulaInfo[] {
        const op = new ConstantOpBuilder()
            .inTypes([t.number])
            .outType(t.number)
            .value(this.value)
            .build()
        return [new FormulaInfoBuilder()
            .head(HEADLESS)
            .op(op)
            .inNodes([])
            .build()]
    }

    /**
     * Constant opinfo is always as a leaf node and only internal node is
     * supposed to use this function.
     */
    // tslint:disable-next-line: prefer-function-over-method
    protected collectFormulaInfo(): readonly SubFormulaInfo[] {
        return []
    }
}

export function isConstant(obj: unknown): obj is Constant {
    return obj instanceof Constant
}
