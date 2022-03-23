import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'
import {getResolvedNode, ResolvedNode} from '@logi/src/lib/intellisense/utils'
export const enum Type {
    UNKONWN,
    WARNING,
    UNDEFINED,
    /**
     * Used in `error` plugin.
     */
    INVALID_FORMULA,
    GRAMMAR,
    FUNCTION,
    LACK_PATH,
}

export interface HoverInfo {
    readonly message: string
    /**
     * Path units is supposed to show where this path leads.
     */
    readonly resolvedNodes: readonly ResolvedNode[]
    readonly type: Type
}

class HoverInfoImpl implements Impl<HoverInfo> {
    public message!: string
    public resolvedNodes: readonly ResolvedNode[] = []
    public type = Type.UNKONWN
}

export class HoverInfoBuilder extends Builder<HoverInfo, HoverInfoImpl> {
    public constructor(obj?: Readonly<HoverInfo>) {
        const impl = new HoverInfoImpl()
        if (obj)
            HoverInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public message(message: string): this {
        this.getImpl().message = message
        return this
    }

    public resolvedNodes(resolvedNodes: readonly ResolvedNode[]): this {
        this.getImpl().resolvedNodes = resolvedNodes
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return HoverInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['message', 'type']
}

export function isHoverInfo(value: unknown): value is HoverInfo {
    return value instanceof HoverInfoImpl
}

export function assertIsHoverInfo(value: unknown): asserts value is HoverInfo {
    if (!(value instanceof HoverInfoImpl))
        throw Error('Not a HoverInfo!')
}

export function unexpectedEndInfo(): HoverInfo {
    return new HoverInfoBuilder()
        .message('表达式不合法')
        .type(Type.INVALID_FORMULA)
        .build()
}

export function unrecorgnizedInfo(): HoverInfo {
    return new HoverInfoBuilder()
        .message('未识别部分，请检查语法')
        .type(Type.GRAMMAR)
        .build()
}

export function lackCharInfo(char: string): HoverInfo {
    return new HoverInfoBuilder()
        .message(`缺少${char}`)
        .type(Type.FUNCTION)
        .build()
}

export function multiNodesInfo(nodes: readonly Readonly<Node>[]): HoverInfo {
    const resolved = nodes.map(getResolvedNode)
    return new HoverInfoBuilder()
        .resolvedNodes(resolved)
        .message('该路径指向了多个目标，请进一步补充路径信息')
        .type(Type.LACK_PATH)
        .build()
}

export function invalidOpImageInfo(): HoverInfo {
    return new HoverInfoBuilder()
        .message('无此函数,请检查')
        .type(Type.FUNCTION)
        .build()
}

export function wrongParas(msg: string): HoverInfo {
    return new HoverInfoBuilder().message(msg).type(Type.FUNCTION).build()
}

export function singleNodeInfo(node: Readonly<Node>): HoverInfo {
    const resolved = [getResolvedNode(node)]
    return new HoverInfoBuilder()
        .resolvedNodes(resolved)
        .message('')
        .type(Type.UNKONWN)
        .build()
}

export function undefinedRefInfo(): HoverInfo {
    return new HoverInfoBuilder().message('未定义引用').type(Type.UNDEFINED).build()
}
