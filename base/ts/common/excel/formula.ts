// tslint:disable: no-type-assertion
// tslint:disable: unknown-paramenter-for-type-predicate unknown-instead-of-any
import {Address, AddressBuilder} from './address'
/**
 * The definition of the ast node of the excel formula.
 * Used to provide the typings because of the poor support in spreadjs.
 *
 * Examples:
 * import * as GC from '@grapcecity/spread-sheets'
 *
 */

export const enum ExcelNodeType {
    UNKNOWN = 0,
    REFERENCE = 1,
    NUMBER = 2,
    STRING = 3,
    BOOLEAN = 4,
    ERROR = 5,
    ARRAY = 6,
    FUNCTION = 7,
    NAME = 8,
    OPERATOR = 9,
    PARENTHESE = 10,
    MISSING_ARGUMENT = 11,
    EXPAND = 12,
    STRUCT_REFERENCE = 13,
    SPILL_REFERENCE = 14,
}

export interface ExcelNode {
    readonly type: ExcelNodeType
}

export interface ExcelError extends ExcelNode {
    readonly value: unknown
}

// tslint:disable-next-line: no-empty-interface
export interface MissingArgument extends ExcelNode {}

export interface Parenthese extends ExcelNode {
    readonly value: ExcelNode
}

export interface ExcelNumber extends ExcelNode {
    readonly value: number
    readonly originalValue: string
}

export interface ExcelString extends ExcelNode {
    readonly value: string
}

export interface ExcelBoolean extends ExcelNode {
    readonly value: boolean
}

export interface ExcelFunction extends ExcelNode {
    readonly functionName: string
    // tslint:disable-next-line: no-banned-terms
    readonly arguments: readonly ExcelNode[]
}

export interface ExcelOp extends ExcelNode {
    /**
     * It should be an enum. But we did not find an enum in spreadjs. Needs our
     * effort to figure it out.
     */
    readonly operatorType: ExcelOpType
    readonly value?: ExcelNode
    readonly value2?: ExcelNode
}

export const enum ExcelOpType {
    PLUS = 3,
    SUBSTRACT = 4,
    MULTIPLY = 5,
    DIVIDE = 6,
    POWER = 7, // ^
    CONCAT = 8, // &
    EQ = 9,
    NOT_EQ = 10,
    LT = 11,
    LE = 12,
    GT = 13,
    GE = 14,
}

export interface Source {
    /**
     * Sheet name.
     */
    readonly u4: string
}

export interface ExcelRef extends ExcelNode {
    readonly isFullRow?: boolean
    readonly isFullColumn?: boolean
    readonly row: number
    readonly column: number
    readonly endRow?: number
    readonly endColumn?: number
    readonly rowRelative: boolean
    readonly columnRelative: boolean
    readonly endRowRelative?: boolean
    readonly endColumnRelative?: boolean
    readonly isArrayReference?: boolean
    /**
     * Cross sheet reference.
     */
    readonly source?: Source
}

function getChildren(node: ExcelNode): readonly ExcelNode[] {
    const leafNodes = [
        ExcelNodeType.BOOLEAN,
        ExcelNodeType.NUMBER,
        ExcelNodeType.REFERENCE,
        ExcelNodeType.STRING,
        ExcelNodeType.ERROR,
        ExcelNodeType.MISSING_ARGUMENT,
    ]
    if (leafNodes.includes(node.type))
        return []
    if (node.type === ExcelNodeType.FUNCTION) {
        const func = node as ExcelFunction
        return func.arguments
    }
    if (node.type === ExcelNodeType.OPERATOR) {
        const op = node as ExcelOp
        const subnodes: ExcelNode[] = []
        if (op.value !== undefined)
            subnodes.push(op.value)
        if (op.value2 !== undefined)
            subnodes.push(op.value2)
        return subnodes
    }
    if (node.type === ExcelNodeType.PARENTHESE) {
        const op = node as Parenthese
        return [op.value]
    }
    // tslint:disable-next-line: no-throw-unless-asserts
    throw Error(`Not implemented: ${node.type}: ${node}`)
}

export function getRefs(
    node: ExcelNode,
    sheetName: string,
): readonly Address[] {
    const children = [node]
    const result: Address[] = []
    while (children.length > 0) {
        const curr = children.pop() as ExcelNode
        if (curr.type === ExcelNodeType.REFERENCE) {
            const ref = curr as ExcelRef
            if (ref.endRow === undefined || ref.endColumn === undefined)
                result.push(new AddressBuilder()
                    .row(ref.row)
                    .col(ref.column)
                    .sheetName(ref.source?.u4 ?? sheetName)
                    .build())
            else
                for (let i = ref.row; i <= ref.endRow; i += 1)
                    for (let j = ref.column; j <= ref.endColumn; j += 1)
                        result.push(new AddressBuilder()
                            .row(ref.row + i)
                            .col(ref.column + j)
                            .sheetName(ref.source?.u4 ?? sheetName)
                            .build())

            continue
        }
        children.push(...getChildren(curr))
    }
    return result
}

export function getLeafNodes(node: ExcelNode): readonly ExcelNode[] {
    const children = [node]
    const result: ExcelNode[] = []
    while (children.length > 0) {
        const curr = children.pop() as ExcelNode
        const subnodes = getChildren(curr)
        if (subnodes.length === 0)
            result.push(curr)
        else
            children.push(...subnodes)
    }
    return result
}

export function assertIsReference(obj: any): asserts obj is ExcelRef {
    if (typeof obj.row !== 'number')
        throw Error('Prop row')
    if (typeof obj.column !== 'number')
        throw Error('Prop column')
    if (typeof obj.rowRelative !== 'boolean')
        throw Error('Prop rowRelative')
    if (typeof obj.columnRelative !== 'boolean')
        throw Error('Prop columnRelative')
}

export function assertIsExcelNumber(obj: any): asserts obj is ExcelNumber {
    if (typeof obj.value !== 'number')
        throw Error('Prop value')
    if (typeof obj.originalValue !== 'string')
        throw Error('Prop originalValue')
}

export function assertIsExcelBoolean(obj: any): asserts obj is ExcelBoolean {
    if (typeof obj.value !== 'boolean')
        throw Error('Prop value')
}

export function assertIsExcelString(obj: any): asserts obj is ExcelString {
    if (typeof obj.value !== 'string')
        throw Error('Prop value')
}

export function assertIsExcelFunction(obj: any): asserts obj is ExcelFunction {
    if (obj?.arguments?.length === undefined || obj?.arguments.length <= 0)
        throw Error('Prop arguments')
}

// @ts-ignore
// tslint:disable-next-line: no-throw-unless-asserts no-empty no-unused
export function assertIsOperator(obj: any): asserts obj is ExcelOp {}

// @ts-ignore
// tslint:disable-next-line: no-throw-unless-asserts no-empty no-unused
export function assertIsError(obj: any): asserts obj is ExcelError {}

// @ts-ignore
// tslint:disable-next-line: no-throw-unless-asserts no-empty no-unused
export function assertIsParenthese(obj: any): asserts obj is Parenthese {}

/**
 * Given 2 syntax tree, find out that if they are equal except the input value.
 */
export function typeEqual(n1?: ExcelNode, n2?: ExcelNode): boolean {
    if (n1 === undefined && n2 === undefined)
        return true
    if (n1 === undefined || n2 === undefined)
        return false
    if (n1.type !== n2.type)
        return false
    if (n1.type === ExcelNodeType.FUNCTION) {
        assertIsExcelFunction(n1)
        assertIsExcelFunction(n2)
        return funcTypeEqual(n1, n2)
    }
    if (n1.type === ExcelNodeType.OPERATOR) {
        assertIsOperator(n1)
        assertIsOperator(n2)
        return opTypeEqual(n1, n2)
    }
    if (n1.type === ExcelNodeType.STRING) {
        assertIsExcelString(n1)
        assertIsExcelString(n2)
        return n1.value === n2.value
    }
    if (n1.type === ExcelNodeType.NUMBER) {
        assertIsExcelNumber(n1)
        assertIsExcelNumber(n2)
        return n1.value === n2.value && n1.originalValue === n2.originalValue
    }
    if (n1.type === ExcelNodeType.BOOLEAN) {
        assertIsExcelBoolean(n1)
        assertIsExcelBoolean(n2)
        return n1.value === n2.value
    }
    if (n1.type === ExcelNodeType.PARENTHESE) {
        assertIsParenthese(n1)
        assertIsParenthese(n2)
        return typeEqual(n1.value, n2.value)
    }
    if (n1.type === ExcelNodeType.MISSING_ARGUMENT)
        return true
    if (n1.type === ExcelNodeType.REFERENCE) {
        assertIsReference(n1)
        assertIsReference(n2)
        return refTypeEqual(n1, n2)
    }
    if (n1.type === ExcelNodeType.ERROR) {
        assertIsError(n1)
        assertIsError(n2)
        // @ts-ignore
        return n1.value._code === n2.value._code
    }
    // tslint:disable-next-line: no-throw-unless-asserts
    throw Error(`Type Equal not implemented: ${n1.type}`)
}

function funcTypeEqual(f1: ExcelFunction, f2: ExcelFunction): boolean {
    if (f1.functionName !== f2.functionName)
        return false
    if (f1.arguments.length !== f2.arguments.length)
        return false
    for (let i = 0; i < f1.arguments.length; i += 1)
        if (!typeEqual(f1.arguments[i], f2.arguments[i]))
            return false
    return true
}

function opTypeEqual(op1: ExcelOp, op2: ExcelOp): boolean {
    if (op1.operatorType !== op2.operatorType)
        return false
    return typeEqual(op1.value, op2.value) && typeEqual(op1.value2, op2.value2)
}

function refTypeEqual(ref1: ExcelRef, ref2: ExcelRef): boolean {
    if (ref1.endRow !== undefined && ref2.endRow !== undefined)
        return true
    if (ref1.endRow === undefined && ref2.endRow === undefined)
        return true
    return false
}
