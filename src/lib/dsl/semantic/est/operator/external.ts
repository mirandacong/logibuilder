import {Builder} from '@logi/base/ts/common/builder'

import {Constant} from '../constant'
import {FormulaInfo, Node, SubFormulaInfo, Type, ValidateRule} from '../node'
import {Reference} from '../reference'

import {Operator, OperatorType} from './base'
import {EXTERNAL_REGISTRY} from './registry'
import {Signature} from './signature'
import {Operator as Type1} from './type1'
import {Operator as Type10} from './type10'
import {Operator as Type2} from './type2'
import {Operator as Type3} from './type3'
import {Operator as Type4} from './type4'
import {Operator as Type5} from './type5'
import {getValidateRule} from './validate'

type Converter = (op: Readonly<Operator>) => Readonly<Operator>

interface BuiltinExternal {
    readonly image: string
    readonly converter: Converter
    readonly validator: ValidateRule
}

class BuiltinExternalImpl implements BuiltinExternal {
    public image!: string
    public converter!: Converter
    public validator!: ValidateRule
}

class BuiltinExternalBuilder extends
    Builder<BuiltinExternal, BuiltinExternalImpl> {
    public constructor(obj?: Readonly<BuiltinExternal>) {
        const impl = new BuiltinExternalImpl()
        if (obj)
            BuiltinExternalBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    public converter(converter: Converter): this {
        this.getImpl().converter = converter
        return this
    }

    public validator(validator: ValidateRule): this {
        this.getImpl().validator = validator
        return this
    }

    protected get daa(): readonly string[] {
        return BuiltinExternalBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['image', 'converter', 'validator']
}

const DIFF = new BuiltinExternalBuilder()
    .image('.diff')
    .converter(diffConverter)
    .validator(getValidator('.diff'))
    .build()

const GROWTH = new BuiltinExternalBuilder()
    .image('.growth')
    .converter(growthConverter)
    .validator(getValidator('.growth'))
    .build()

/**
 * AVERAGEIFV({ref1}, {ref2}, ...)
 */
const AVERAGEIFV1 = new BuiltinExternalBuilder()
    .image('averageifv')
    .converter(averageifv1Converter)
    .validator(getValidator('averageifv'))
    .build()

/**
 * {ref}.averageifv()
 */
const AVERAGEIFV2 = new BuiltinExternalBuilder()
    .image('.averageifv')
    .converter(averageifv2Converter)
    .validator(getValidator('.averageifv'))
    .build()

const AVERAGEPREVIOUS = new BuiltinExternalBuilder()
    .image('.averageprevious')
    .converter(averagepreviousConverter)
    .validator(getValidator('.averageprevious'))
    .build()

const PREVIOUS = new BuiltinExternalBuilder()
    .image('.previous')
    .converter(previousConverter)
    .validator(getValidator('.previous'))
    .build()

const LATTER = new BuiltinExternalBuilder()
    .image('.latter')
    .converter(latterConverter)
    .validator(getValidator('.latter'))
    .build()

const YEARS = new BuiltinExternalBuilder()
    .image('.years')
    .converter(yearsConverter)
    .validator(getValidator('.years'))
    .build()

const HALFYEARS = new BuiltinExternalBuilder()
    .image('.halfyears')
    .converter(halfyearsConverter)
    .validator(getValidator('.halfyears'))
    .build()

const QUARTERS = new BuiltinExternalBuilder()
    .image('.quarters')
    .converter(quartersConverter)
    .validator(getValidator('.quarters'))
    .build()

const MONTHS = new BuiltinExternalBuilder()
    .image('.months')
    .converter(monthsConverter)
    .validator(getValidator('.months'))
    .build()

/**
 * {ref}.diff(constant) = {ref} - {ref}.lag(constant)
 */
function diffConverter(op: Readonly<Operator>): Readonly<Operator> {
    const constant = op.children[0]
    const ref = op.children[1]
    const tok = op.token
    const lag = new Type3('.lag', [constant, ref].map(clone), tok)
    return new Type1('-', [ref, lag].map(clone), tok)
}

/**
 * {ref}.growth() = {ref} / {ref}.lag(1) - 1
 */
function growthConverter(op: Readonly<Operator>): Readonly<Operator> {
    const lagConstant = new Constant(1, '1')
    const ref = op.children[0]
    const tok = op.token
    const lag = new Type3('.lag', [lagConstant, clone(ref)], tok)
    const div = new Type1('/', [clone(ref), lag], tok)
    const subConstant = new Constant(1, '1')
    return new Type1('-', [div, subConstant], tok)
}

/**
 * averageifv({ref1}, {ref2}) =
 *      sum(iferror({ref1, 0}, iferror({ref2, 0}))) / count({ref1}, {ref2})
 */
function averageifv1Converter(op: Readonly<Operator>): Readonly<Operator> {
    const children = op.children
    const iferrorOps: Operator[] = []
    children.forEach((child: Readonly<Node>): void => {
        const iferror = new Type1(
            'iferror',
            [clone(child), new Constant(0, '0')], op.token,
        )
        iferrorOps.push(iferror)
    })
    const count = new Type1('count', children.map(clone), op.token)
    const sum = new Type1('sum', iferrorOps, op.token)
    return new Type1('/', [sum, count], op.token)
}

/**
 * {a}.averageifv2() = iferror({a}, 0).sum() / {a}.count()
 */
function averageifv2Converter(op: Readonly<Operator>): Readonly<Operator> {
    const ref = op.children[0]
    const tok = op.token
    const iferror = new Type1(
        'iferror',
        [clone(ref), new Constant(0, '0')],
        tok,
    )
    const sum = new Type2('.sum', [iferror], tok)
    const count = new Type2('.count', [clone(ref)], tok)
    return new Type1('/', [sum, count], tok)
}

function averagepreviousConverter(op: Readonly<Operator>): Readonly<Operator> {
    // tslint:disable-next-line: no-type-assertion
    const constant = op.children[0] as Constant
    const ref = op.children[1]
    const tok = op.token
    const previous =
        new Type10(`[__dp${constant.image}__ AND __sr__]`, [ref], tok)
    return new Type2('.average', [previous], tok)
}

function previousConverter(op: Readonly<Operator>): Readonly<Operator> {
    // tslint:disable-next-line: no-type-assertion
    const constant = op.children[0] as Constant
    const ref = op.children[1]
    const tok = op.token
    return new Type10(`[__dp${constant.image}__ AND __sr__]`, [ref], tok)
}

function latterConverter(op: Readonly<Operator>): Readonly<Operator> {
    // tslint:disable-next-line: no-type-assertion
    const constant = op.children[0] as Constant
    const ref = op.children[1]
    const tok = op.token
    return new Type10(`[__dl${constant.image}__ AND __sr__]`, [ref], tok)
}

function yearsConverter(op: Readonly<Operator>): Readonly<Operator> {
    const ref = op.children[0]
    /**
     * __dse0y__ Get all the columns within the time of the current column.
     * __fy__ Get the columns whose frequency is the year.
     */
    return new Type10('[__dse0y__ AND __fy__]', [ref], op.token)
}

function halfyearsConverter(op: Readonly<Operator>): Readonly<Operator> {
    const ref = op.children[0]
    return new Type10('[__dse0y__ AND __fhy__]', [ref], op.token)
}

function quartersConverter(op: Readonly<Operator>): Readonly<Operator> {
    const ref = op.children[0]
    return new Type10('[__dse0y__ AND __fq__]', [ref], op.token)
}

function monthsConverter(op: Readonly<Operator>): Readonly<Operator> {
    const ref = op.children[0]
    return new Type10('[__dse0y__ AND __fm__]', [ref], op.token)
}

function clone(opInfo: Readonly<Node>): Readonly<Node> {
    switch (opInfo.type) {
    case Type.CONSTANT:
        const constant = opInfo as Constant
        return new Constant(constant.value, constant.image)
    case Type.REFERENCE:
        const ref = opInfo as Reference
        const newRef = new Reference(ref.path)
        if (ref.hierarchyNode !== undefined)
            newRef.hierarchyNode = ref.hierarchyNode
        return newRef
    case Type.OPERATOR:
        const operator = opInfo as Operator
        const children = operator.children.map(clone)
        switch (operator.opType) {
        case OperatorType.TYPE1:
            return new Type1(operator.image, children, operator.token)
        case OperatorType.TYPE2:
            return new Type2(operator.image, children, operator.token)
        case OperatorType.TYPE3:
            return new Type3(operator.image, children, operator.token)
        case OperatorType.TYPE4:
            return new Type4(operator.image, children, operator.token)
        case OperatorType.TYPE5:
            return new Type5(operator.image, children, operator.token)
        case OperatorType.EXTERNAL:
            return new External(operator.image, children, operator.token)
        default:
            return new Constant(0, '0')
        }
    default:
        return new Constant(0, '0')
    }
}

export class External extends Operator {
    // tslint:disable-next-line: no-optional-parameter
    public static supportedOpNames(): readonly string[] {
        return External.__BUILTIN_LIST__
            .map((buildin: BuiltinExternal): string => buildin.image)
    }
    public readonly opType = OperatorType.EXTERNAL

    public convert(): Readonly<Operator> {
        const builtin = External.__BUILTIN_LIST__
            .find((value: BuiltinExternal): boolean =>
                value.image === this.image)
        if (builtin === undefined)
            return this
        return builtin.converter(this)
    }

    // tslint:disable-next-line: prefer-function-over-method
    public buildFormulaInfo(): readonly FormulaInfo[] {
        if (this.validate() !== undefined)
            return []
        const converted = this.convert()
        return converted.getFormulaInfo()
    }

    // tslint:disable-next-line: prefer-function-over-method
    public collectFormulaInfo(): readonly SubFormulaInfo[] {
        return []
    }
    protected validateRules: readonly ValidateRule[] = VALIDATE_RULES
    private static __BUILTIN_LIST__: readonly BuiltinExternal[] = [
        AVERAGEIFV1,
        AVERAGEIFV2,
        AVERAGEPREVIOUS,
        DIFF,
        GROWTH,
        LATTER,
        PREVIOUS,
        YEARS,
        HALFYEARS,
        QUARTERS,
        MONTHS,
    ]
}

export function assertIsExternalOperator(
    opNode: unknown,
): asserts opNode is Readonly<External> {
    if (!(opNode instanceof External))
        throw Error('Not a externalOperator!.')
}

export function isExternalOperator(
    opNode: unknown,
): opNode is Readonly<External> {
    return opNode instanceof External
}

const VALIDATE_RULES = EXTERNAL_REGISTRY.map(getValidateRule)

function getValidator(image: string): ValidateRule {
    const sign = EXTERNAL_REGISTRY.find((s: Signature): boolean =>
        s.image === image)
    return sign !== undefined
        ? getValidateRule(sign)
        // tslint:disable-next-line: no-empty
        : (): void => {}
}
