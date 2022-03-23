import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export interface FuncHelperResponse {
    readonly description: string
    readonly parts: readonly HelperPart[]
    /**
     * Indicating the index of function name unit in the text display units.
     */
    readonly imageIndex: number
}

class FuncHelperResponseImpl implements Impl<FuncHelperResponse> {
    public description!: string
    public parts: readonly HelperPart[] = []
    public imageIndex!: number
}

export class FuncHelperResponseBuilder
    extends Builder<FuncHelperResponse, FuncHelperResponseImpl> {
    public constructor(obj?: Readonly<FuncHelperResponse>) {
        const impl = new FuncHelperResponseImpl()
        if (obj)
            FuncHelperResponseBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public description(description: string): this {
        this.getImpl().description = description
        return this
    }

    public parts(parts: readonly HelperPart[]): this {
        this.getImpl().parts = parts
        return this
    }

    public imageIndex(imageIndex: number): this {
        this.getImpl().imageIndex = imageIndex
        return this
    }

    protected get daa(): readonly string[] {
        return FuncHelperResponseBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'description',
        'parts',
    ]
}

export function isFuncHelperResponse(
    value: unknown,
): value is FuncHelperResponse {
    return value instanceof FuncHelperResponseImpl
}

export function assertIsFuncHelperResponse(
    value: unknown,
): asserts value is FuncHelperResponse {
    if (!(value instanceof FuncHelperResponseImpl))
        throw Error('Not a FuncHelperResponse!')
}

export const enum HelperPartType {
    REFERENCE,
    DOT,
    NAME,
    BRACKET,
    COMMON,
    REQ_ARG,
    OPT_ARG,
    INFINITE_ARG,
}

export interface HelperPart {
    readonly content: string
    readonly type: HelperPartType
    readonly isCurrent: boolean
}

class HelperPartImpl implements Impl<HelperPart> {
    public content!: string
    public type!: HelperPartType
    public isCurrent = false
}

export class HelperPartBuilder extends Builder<HelperPart, HelperPartImpl> {
    public constructor(obj?: Readonly<HelperPart>) {
        const impl = new HelperPartImpl()
        if (obj)
            HelperPartBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public content(content: string): this {
        this.getImpl().content = content
        return this
    }

    public type(type: HelperPartType): this {
        this.getImpl().type = type
        return this
    }

    public isCurrent(isCurrent: boolean): this {
        this.getImpl().isCurrent = isCurrent
        return this
    }

    protected get daa(): readonly string[] {
        return HelperPartBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'content',
        'type',
    ]
}

export function isHelperPart(value: unknown): value is HelperPart {
    return value instanceof HelperPartImpl
}

export function assertIsHelperPart(
    value: unknown,
): asserts value is HelperPart {
    if (!(value instanceof HelperPartImpl))
        throw Error('Not a HelperPart!')
}
