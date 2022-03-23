import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export const enum ArgType {
    ARRAY,
    DATE,
    NUMBER,
    BOOLEAN,
    MATRIX,
}

/**
 * Used to describe the infinite parameters
 */
export interface Range {
    readonly start: number
    readonly end: number
}

class RangeImpl implements Impl<Range> {
    public start!: number
    public end!: number
}

export class RangeBuilder extends Builder<Range, RangeImpl> {
    public constructor(obj?: Readonly<Range>) {
        const impl = new RangeImpl()
        if (obj)
            RangeBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public start(start: number): this {
        this.getImpl().start = start
        return this
    }

    public end(end: number): this {
        this.getImpl().end = end
        return this
    }

    protected get daa(): readonly string[] {
        return RangeBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'end',
        'start',
    ]
}

export function isRange(value: unknown): value is Range {
    return value instanceof RangeImpl
}

export function assertIsRange(value: unknown): asserts value is Range {
    if (!(value instanceof RangeImpl))
        throw Error('Not a Range!')
}

/**
 * Record the attributes of an operator.
 */
export interface Signature {
    readonly image: string
    readonly description: string
    /**
     * The type of the coutable arguments.
     */
    readonly args: readonly Argument[]
    /**
     * Whether this operator has infinite arguments.
     * The type of these infinite armuments is same as the last type in `args`.
     */
    readonly infinite: Range | undefined
    /**
     * The type of the return value.
     */
    readonly returnType: readonly ArgType[]
}

class SignatureImpl implements Impl<Signature> {
    public image!: string
    public description!: string
    public args: readonly Argument[] = []
    public infinite: Range | undefined
    public returnType!: readonly ArgType[]
}

export class SignatureBuilder extends Builder<Signature, SignatureImpl> {
    public constructor(obj?: Readonly<Signature>) {
        const impl = new SignatureImpl()
        if (obj)
            SignatureBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    public description(description: string): this {
        this.getImpl().description = description
        return this
    }

    public args(args: readonly Argument[]): this {
        this.getImpl().args = args
        return this
    }

    public infinite(infinite: Range | undefined): this {
        this.getImpl().infinite = infinite
        return this
    }

    public returnType(returnType: readonly ArgType[]): this {
        this.getImpl().returnType = returnType
        return this
    }

    protected get daa(): readonly string[] {
        return SignatureBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'image',
        'description',
        'returnType',
    ]
}

export function isSignature(value: unknown): value is Signature {
    return value instanceof SignatureImpl
}

export function assertIsSignature(value: unknown): asserts value is Signature {
    if (!(value instanceof SignatureImpl))
        throw Error('Not a Signature!')
}

export interface Argument {
    readonly name: string
    readonly allowType: readonly ArgType[]
    readonly description: string
    readonly isRequired: boolean
}

class ArgumentImpl implements Impl<Argument> {
    public name = ''
    public allowType!: readonly ArgType[]
    public description = ''
    public isRequired = true
}

// tslint:disable-next-line: max-classes-per-file
export class ArgumentBuilder extends Builder<Argument, ArgumentImpl> {
    public constructor(obj?: Readonly<Argument>) {
        const impl = new ArgumentImpl()
        if (obj)
            ArgumentBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public allowType(allowType: readonly ArgType[]): this {
        this.getImpl().allowType = allowType
        return this
    }

    public isRequired(isRequired: boolean): this {
        this.getImpl().isRequired = isRequired
        return this
    }

    public description(description: string): this {
        this.getImpl().description = description
        return this
    }

    protected get daa(): readonly string[] {
        return ArgumentBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['allowType']
}

export function isArgument(value: unknown): value is Argument {
    return value instanceof ArgumentImpl
}

export function assertIsArgument(value: unknown): asserts value is Argument {
    if (!(value instanceof ArgumentImpl))
        throw Error('Not a Argument!')
}

export function buildBoolArg(
    name = '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType([ArgType.BOOLEAN])
        .isRequired(isRequired)
        .build()
}

export function buildNumAndArrayUnionArg(
    name = '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType([ArgType.NUMBER, ArgType.ARRAY])
        .isRequired(isRequired)
        .build()
}

export function buildNumAndBoolUnionArg(
    name = '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType([ArgType.NUMBER, ArgType.BOOLEAN])
        .isRequired(isRequired)
        .build()
}

export function buildNumberArg(
    name= '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType([ArgType.NUMBER])
        .isRequired(isRequired)
        .build()
}

export function buildArrayArg(
    name = '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType([ArgType.ARRAY])
        .isRequired(isRequired)
        .build()
}

export function buildDateArg(
    name = '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType([ArgType.DATE])
        .isRequired(isRequired)
        .build()
}

export function buildAllTypeArg(
    name = '',
    desc = '',
    isRequired = true,
): Argument {
    return new ArgumentBuilder()
        .name(name)
        .description(desc)
        .allowType(
            [ArgType.ARRAY, ArgType.BOOLEAN, ArgType.NUMBER, ArgType.DATE],
        )
        .isRequired(isRequired)
        .build()
}
