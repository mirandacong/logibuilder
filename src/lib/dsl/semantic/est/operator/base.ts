import {Token} from '@logi/src/lib/dsl/lexer/v2'

import {Node, Type} from '../node'

export const enum OperatorType {
    /**
     * Prefix operator like sum({a}, {b})
     */
    TYPE1,
    /**
     * Postfix operator like {a}.sum()
     */
    TYPE2,
    /**
     * Postfix operator and the operator is includes by `TYPE_3_OPERATOR`
     */
    TYPE3,
    /**
     * Methods of cos, irr, log, npv, power, round, sin.
     */
    TYPE4,
    /**
     * Empty formula, for the case of the empty string.
     */
    TYPE5,
    /**
     * Bool expression of header name and labels.
     */
    TYPE6,
    /**
     * The methods of year and day like {a}.year().
     */
    TYPE7,
    /**
     * Suffix operator like TYPE2, but it has headers. Like {a}.linear(1, 4).
     */
    TYPE8,
    /**
     * The slice range type like {a}[slice1::slice2].
     */
    TYPE9,
    /**
     * The postfix operator that return the array.
     */
    TYPE10,
    /**
     * The operator defined by users.
     */
    EXTERNAL,
    /**
     * The opeator that is not defined.
     */
    UNDEFINED,
}

export abstract class Operator extends Node {
    public constructor(
        public readonly image: string,
        public readonly children: readonly Readonly<Node>[],
        public readonly token: Readonly<Token>,
        ) {
        super(children)
    }
    public readonly abstract opType: OperatorType
    public readonly type = Type.OPERATOR
}

export function isOperator(obj: unknown): obj is Operator {
    return obj instanceof Operator
}
