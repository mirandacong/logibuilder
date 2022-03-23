import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {REGISTRY} from './registry'
import {ArgType, Argument, Signature} from './signature'

export interface Usage {
    readonly rowType: readonly UsageFunc[]
    readonly colType: readonly UsageFunc[]
}

class UsageImpl implements Impl<Usage> {
    public rowType: readonly UsageFunc[] = []
    public colType: readonly UsageFunc[] = []
}

export class UsageBuilder extends Builder<Usage, UsageImpl> {
    public constructor(obj?: Readonly<Usage>) {
        const impl = new UsageImpl()
        if (obj)
            UsageBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public rowType(rowType: readonly UsageFunc[]): this {
        this.getImpl().rowType = rowType
        return this
    }

    public colType(colType: readonly UsageFunc[]): this {
        this.getImpl().colType = colType
        return this
    }
}
export interface UsageFunc {
    readonly name: string
    readonly description: string
    readonly args: readonly UsageArg[]
    readonly returnType: string
    readonly example: string
}

class UsageFuncImpl implements Impl<UsageFunc> {
    public name!: string
    public description!: string
    public args: readonly UsageArg[] = []
    public returnType!: string
    public example!: string
}

export class UsageFuncBuilder extends Builder<UsageFunc, UsageFuncImpl> {
    public constructor(obj?: Readonly<UsageFunc>) {
        const impl = new UsageFuncImpl()
        if (obj)
            UsageFuncBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public description(description: string): this {
        this.getImpl().description = description
        return this
    }

    public args(args: readonly UsageArg[]): this {
        this.getImpl().args = args
        return this
    }

    public returnType(returnType: string): this {
        this.getImpl().returnType = returnType
        return this
    }

    public example(example: string): this {
        this.getImpl().example = example
        return this
    }

    protected get daa(): readonly string[] {
        return UsageFuncBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'description',
        'returnType',
        'example',
    ]
}

export interface UsageArg {
    readonly name: string
    readonly types: string
    readonly repeated: boolean
    readonly optional: boolean
    readonly description: string
}

class UsageArgImpl implements Impl<UsageArg> {
    public name!: string
    public types!: string
    public repeated = false
    public optional = false
    public description!: string
}

// tslint:disable-next-line: max-classes-per-file
export class UsageArgBuilder extends Builder<UsageArg, UsageArgImpl> {
    public constructor(obj?: Readonly<UsageArg>) {
        const impl = new UsageArgImpl()
        if (obj)
            UsageArgBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public types(types: string): this {
        this.getImpl().types = types
        return this
    }

    public repeated(repeated: boolean): this {
        this.getImpl().repeated = repeated
        return this
    }

    public optional(optional: boolean): this {
        this.getImpl().optional = optional
        return this
    }

    public description(description: string): this {
        this.getImpl().description = description
        return this
    }

    protected get daa(): readonly string[] {
        return UsageArgBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'types',
        'description',
    ]
}

export function getUsage(): Usage {
    const ignore = ['+', '-', '*', '/', '>', '<', '=', '<=', '>=', '::', '[]',
        '[::]']
    const rowType = REGISTRY
        .filter((s: Signature): boolean =>
            !s.image.startsWith('.') && s.image !== '' &&
            !ignore.includes(s.image))
        .sort((a: Signature, b: Signature): number =>
            a.image < b.image ? -1 : 1)
    const colType = REGISTRY
        .filter((s: Signature): boolean =>
            s.image.startsWith('.'))
        .sort((a: Signature, b: Signature): number =>
            a.image < b.image ? -1 : 1)
    return new UsageBuilder()
        .rowType(getFunction(rowType))
        .colType(getFunction(colType))
        .build()
}

function getFunction(sign: readonly Signature[]): readonly UsageFunc[] {
    return sign.map((s: Signature): UsageFunc => {
        const name = !s.image.startsWith('.')
            ? s.image.toUpperCase()
            : s.image.slice(1).toLowerCase()
        const desc = s.description === '' ? '暂无' : s.description
        const args = getArgs(s)
        const returnType = typeToString(s.returnType)
        const example = getExample(s)
        return new UsageFuncBuilder()
            .name(name)
            .description(desc)
            .args(args)
            .returnType(returnType)
            .example(example)
            .build()
    })
}

function getArgs(s: Signature): readonly UsageArg[] {
    if (s.args.length === 0)
        return []
    return s.args.map((arg: Argument, idx: number): UsageArg => {
        const name = arg.name === '' ? '值' : arg.name
        const types = typeToString(arg.allowType)
        const repeated = s.infinite !== undefined &&
            s.infinite.start <= idx && idx <= s.infinite.end
        const desc = arg.description === '' ? '暂无' : arg.description
        return new UsageArgBuilder()
            .name(name)
            .types(types)
            .repeated(repeated)
            .optional(!arg.isRequired)
            .description(desc)
            .build()
    })
}

function typeToString(types: readonly ArgType[]): string {
    if (types.length === 0)
        return '空值'
    return types
        .map((t: ArgType): string => {
            switch (t) {
            case ArgType.ARRAY: return '数组'
            case ArgType.DATE: return '日期'
            case ArgType.NUMBER: return '数值'
            case ArgType.BOOLEAN: return '布尔值'
            case ArgType.MATRIX: return '矩阵'
            default: return ''
            }
        })
        .join(' | ')
}

function getExample(s: Signature): string {
    const funcName = s.image.startsWith('.')
        ? '{ref}' + s.image.toLowerCase()
        : s.image.toUpperCase()
    const argsStrList: string[] = []
    if (s.infinite === undefined)
        argsStrList.push(...s.args.map((a: Argument): string => argToString(a)))
    // tslint:disable-next-line: brace-style
    else {
        const before = s.args.slice(0, s.infinite.start).map((
            a: Argument,
        ): string => argToString(a))
        argsStrList.push(...before)
        const repeatTime = 2
        const infiniteArgs = s.args.slice(s.infinite.start, s.infinite.end + 1)
        for (let i = 1; i <= repeatTime; i += 1)
            infiniteArgs.forEach((arg: Argument): void => {
                const argStr = argToString(arg, i)
                argsStrList.push(argStr)
            })
        argsStrList.push('...')
        const after = s.args.slice(s.infinite.end + 1).map((
            a: Argument,
        ): string => argToString(a))
        argsStrList.push(...after)
    }
    s.args.forEach((arg: Argument): string => {
        if (s.infinite === undefined)
            return `${arg.name}: ${typeToString(arg.allowType)}`
        return ''
    })
    const argsStr = argsStrList.join(', ')
    return `${funcName}(${argsStr})`
}

function argToString(arg: Argument, idx?: number): string {
    let str = arg.name === '' ? 'argument' : arg.name
    if (idx !== undefined)
        str += `${idx}`
    if (!arg.isRequired)
        str = `[${str}]`
    return str
}
