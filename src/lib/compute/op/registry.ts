// tslint:disable-next-line: no-wildcard-import
import * as t from 'io-ts'

import {AtomicOpBuilder} from './atomic'
import {Op} from './node'
class OpRegistry {
    /**
     * Register a Op with the given name.
     *
     * Must match the regexp:
     *      [a-z][_a-z0-9]+(\/[_a-z][_a-z0-9]+)*
     */
    public set(op: Op): void {
        this._map.set(op.name, op)
    }

    public get(opName: string): Op | undefined {
        return this._map.get(opName)
    }

    public has(opName: string): boolean {
        return this._map.has(opName)
    }

    public clear(): void {
        this._map.clear()
    }

    public loadBuiltinOps(): void {
        ATOMIC_FUNCS.forEach((
            func: readonly [string, string, readonly t.Mixed[], t.Mixed,
            // tslint:disable-next-line:no-any
                (...args: unknown[]) => unknown],
        ): void => {
            const op = new AtomicOpBuilder()
                .name(func[0])
                .excelFormulaFormat(func[1])
            // tslint:disable-next-line:no-magic-numbers
                .inTypes(func[2])
            // tslint:disable-next-line:no-magic-numbers
                .outType(func[3])
            // tslint:disable-next-line:no-magic-numbers
                .functor(func[4])
                .build()
            this.set(op)
        },)
    }
    private _map: Map<string, Op> = new Map()
}

const ATOMIC_FUNCS:
    readonly (readonly [
        string,
        string,
        readonly t.Mixed[],
        t.Mixed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: readonly any[]) => any,
    ])[] = [
        [
            'add', '%s+%s', [t.number, t.number], t.number,
            (a: number, b: number): number => a + b,
        ],
        [
            'lt', '%s<%s', [t.number, t.number], t.boolean,
            (a: number, b: number): boolean => a < b,
        ],
        [
            'gt', '%s>%s', [t.number, t.number], t.boolean,
            (a: number, b: number): boolean => a > b,
        ],
        [
            'le', '%s<=%s', [t.number, t.number], t.boolean,
            (a: number, b: number): boolean => a <= b,
        ],
        [
            'ge', '%s>=%s', [t.number, t.number], t.boolean,
            (a: number, b: number): boolean => a >= b,
        ],
        [
            'eq', '%s=%s', [t.number, t.number], t.boolean,
            (a: number, b: number): boolean => a === b,
        ],
        [
            'ne', '%s<>%s', [t.number, t.number], t.boolean,
            (a: number, b: number): boolean => a !== b,
        ],
        [
            'concat', '%s&%s', [t.string, t.string], t.string,
            (a: string, b: string): string => `${a}${b}`,
        ],
        [
            'if', 'if(%v, %s, %s)', [t.string, t.string, t.string], t.string,
            (a: boolean, b: string, c: string): string => a ? b : c,
        ],
        [
            'abs', 'abs(%v)', [t.number], t.number,
            (a: number): number => a,
        ],
        [
            'average', 'average(%v)', [t.array(t.number)], t.number,
            (...a: readonly number[]): number => {
                if (a.length === 0)
                    return 0
                const sum = a.reduce(
                    (pre: number, curr: number): number => pre + curr,
                )

                return sum / a.length
            },
        ],
        [
            /**
             * Counts the numbers within the list of arguments.
             * Get the more infos from the url below:
             *     https://support.office.com/en-us/article/count-function-a59cd7fc-b623-4d93-87a4-d23bf411294c
             */
            'count', 'count(%v)', [t.array(t.any)], t.number,
            // tslint:disable-next-line:no-any
            (...values: readonly unknown[]): number => {
                let count = 0
                // tslint:disable-next-line:no-any
                values.forEach((v: unknown): void => {
                    if ((typeof v) === 'number')
                        count += 1
                })

                return count
            },
        ],
        [
            'div', '%s/%s', [t.number, t.number], t.number,
            (a: number, b: number): number => a / b,
        ],
        [
            'id', '%s', [t.number], t.number,
            (a: number): number => a,
        ],
        [
            'empty', '', [], t.number,
            (): number => 0,
        ],
        [
            'max', 'max(%v)', [t.array(t.number)], t.number,
            (...a: readonly number[]): number => Math.max(...a),
        ],
        [
            'min', 'min(%v)', [t.array(t.number)], t.number,
            (...a: readonly number[]): number => Math.min(...a),
        ],
        [
            'mul', '%s*%s', [t.number, t.number], t.number,
            (a: number, b: number): number => a * b,
        ],
        [
            'muls', '%s*%s', [t.array(t.number), t.number], t.array(t.number),
            (a: readonly number[], b: number): readonly number[] => {
                const result: number[] = []
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < a.length; i += 1) {
                    const v1 = a[i]
                    result.push(v1 * b)
                }

                return result
            },
        ],
        [
            'power', 'power(%s,%s)', [t.number, t.number], t.number,
            (a: number, b: number): number => Math.pow(a, b),
        ],
        [
            'log', 'log(%s,%s)', [t.number, t.number], t.number,
            (): number => 0,
        ],
        [
            'sin', 'sin(%s)', [t.number], t.number,
            (a: number): number => Math.sin(a),
        ],
        [
            'cos', 'cos(%s)', [t.number], t.number,
            (a: number): number => Math.cos(a),
        ],
        [
            'scalar', '', [], t.number,
            (): number => 0,
        ],
        [
            /**
             * Returns the rank of a number in a list of numbers.
             * num: The number whose rank you want to find.
             * list: A list of numbers.
             * order: A number specifying how to rank number. If order
             * is 0 (zero) or omitted, ranks number as if list were a list
             * sorted in descending order. If order is any nonzero value, ranks
             * number as if ref were a list sorted in ascending order.
             * Get the more infos from the url below:
             *     https://support.office.com/en-us/article/rank-function-6a2fc49d-1831-4a03-9d8c-c279cf99f723
             */
            'rank', 'rank(%s,(%v),%s)', [t.number, t.array(t.number),
                t.number], t.number,
            // tslint:disable-next-line: readonly-array
            (num: number, list: number[], order: number): number => {
                const sortedList = list.sort((a: number, b: number): number => {
                    if (order)
                        return a - b
                    return b - a
                })

                return sortedList.indexOf(num) + 1
            },
        ],
        [
            /**
             * Rounds a number to a specified number of digits.
             * num: The number that you want to round.
             * digits: The number of digits to which you want to round the
             * number argument. If num_digits is greater than 0 (zero), then
             * number is rounded to the specified number of decimal places. If
             * num_digits is 0, the number is rounded to the nearest integer. If
             * num_digits is less than 0, the number is rounded to the left of
             * the decimal point.
             * Get the more infos from the url below:
             *     https://support.office.com/en-us/article/round-function-c018c5d8-40fb-4053-90b1-b3e7f61a213c
             */
            'round', 'round(%s,%s)', [t.number, t.number], t.number,
            (num: number, digits: number): number => {
                const ten = 10
                const rate = Math.pow(ten, digits)

                return Math.round(num * rate) / rate
            },
        ],
        [
            'sum', 'sum(%v)', [t.array(t.number)], t.number,
            (...a: readonly number[]): number => {
                const result = a.reduce((sum: number, curr: number): number => {
                    return sum + curr
                })

                // tslint:disable-next-line:no-var-before-return
                return result
            },
        ],
        [
            'sub', '%s-%s', [t.number, t.number], t.number,
            (a: number, b: number): number => a - b,
        ],
        [
            'negative', '-%s', [t.number], t.number,
            (a: number): number => - a,
        ],
        [
            'positive', '+%s', [t.number], t.number,
            (a: number): number => a,
        ],
        [
            'irr', 'irr(%s)', [t.string], t.number,
            (): number => 0,
        ],
        [
            'xirr', 'xirr(%s, %s, %s)', [t.string, t.string, t.number], t.number,
            (): number => 0,
        ],
        [
            'npv', 'npv(%s,%s)', [t.number, t.string], t.number,
            (): number => 0,
        ],
        [
            'xnpv', 'xnpv(%s,%s,%s)', [t.number, t.string, t.string], t.number,
            (): number => 0,
        ],
        [
            'iferror', 'iferror(%s, %s)', [t.string, t.string], t.number,
            (): number => 0,
        ],
        [
            'switch', 'switch(%v)', [t.array(t.number)], t.number,
            (): number => 0,
        ],
        [
            'date', 'date(%s, %s, %s)', [t.number, t.number, t.number], t.number,
            (): number => 0,
        ],
        [
            'to', '%s:%s', [t.string, t.string], t.string,
            (): number => 0,
        ],
        [
            'array', '%v', [t.array(t.number)], t.string,
            (): number => 0,
        ],
        [
            'and', 'AND(%v)', [t.array(t.boolean)], t.boolean,
            (): boolean => true,
        ],
        [
            'or', 'OR(%v)', [t.array(t.boolean)], t.boolean,
            (): boolean => true,
        ],
        [
            'not', 'NOT(%s)', [t.boolean], t.boolean,
            (): boolean => true,
        ],
        [
            'iserror', 'ISERROR(%s)', [t.number], t.boolean,
            (): boolean => true,
        ],
        [
            'yearfrac', 'yearfrac(%s, %s, %s)',
            [t.number, t.number, t.number],
            t.number,
            (): number => 0,
        ],
    ]

export const OP_REGISTRY = new OpRegistry()
OP_REGISTRY.loadBuiltinOps()
// tslint:disable-next-line: no-object
Object.freeze(OP_REGISTRY)
