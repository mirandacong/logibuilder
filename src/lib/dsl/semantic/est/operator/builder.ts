import {Builder} from '@logi/base/ts/common/builder'
import {Token} from '@logi/src/lib/dsl/lexer/v2'

import {Node} from '../node'

import {Operator} from './base'
import {External} from './external'
import {Operator as Type1} from './type1'
import {Operator as Type10} from './type10'
import {Operator as Type2} from './type2'
import {Operator as Type3} from './type3'
import {Operator as Type4} from './type4'
import {Operator as Type5} from './type5'
import {Operator as Type6} from './type6'
import {Operator as Type7} from './type7'
import {Operator as Type8} from './type8'
import {Operator as Type9} from './type9'
import {Operator as Undefined} from './undefined'

export interface BuildInfo {
    readonly image: string
    readonly children: readonly Readonly<Node>[]
    // The operator token.
    readonly token: Readonly<Token>
}

class BuildInfoImpl implements BuildInfo {
    public image!: string
    public children!: readonly Readonly<Node>[]
    public token!: Readonly<Token>
}

export class BuildInfoBuilder
    extends Builder<BuildInfo, BuildInfoImpl> {
    public constructor(obj?: Readonly<BuildInfo>) {
        const impl = new BuildInfoImpl()
        if (obj)
            BuildInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public image(image: string): this {
        this.getImpl().image = image
        return this
    }

    public children(children: readonly Readonly<Node>[]): this {
        this.getImpl().children = children
        return this
    }

    public token(token: Readonly<Token>): this {
        this.getImpl().token = token
        return this
    }

    protected get daa(): readonly string[] {
        return BuildInfoBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'children',
        'image',
        'token',
    ]
}

export function buildOperator(info: BuildInfo): Operator {
    const image = info.image.toLowerCase()
    if (image.startsWith('[') && image.endsWith(']')) {
        if (image.includes('::'))
            return new Type9(image, info.children, info.token)
        if (image.match(/__(.*?)__/))
            return new Type10(image, info.children, info.token)
        return new Type6(image, info.children, info.token)
    }
    if (Type1.supportedOpNames().includes(image))
        return new Type1(image, info.children, info.token)
    if (Type4.supportedOpNames().includes(image))
        return new Type4(image, info.children, info.token)
    if (Type5.supportedOpNames().includes(image))
        return new Type5(image, info.children, info.token)
    if (Type2.supportedOpNames().includes(image))
        return new Type2(image, info.children, info.token)
    if (Type3.supportedOpNames().includes(image))
        return new Type3(image, info.children, info.token)
    if (Type7.supportedOpNames().includes(image))
        return new Type7(image, info.children, info.token)
    if (Type8.supportedOpNames().includes(image))
        return new Type8(image, info.children, info.token)
    if (External.supportedOpNames().includes(image))
        return new External(image, info.children, info.token)
    return new Undefined(image, info.children, info.token)
}

/**
 * Use for intellience to auto-complete.
 */
export function supportedOpInfoNames(): readonly string[] {
    return [
        ...Type1.supportedOpNames(),
        ...Type4.supportedOpNames(),
        ...Type5.supportedOpNames(),
        ...Type2.supportedOpNames(),
        ...Type3.supportedOpNames(),
        ...Type7.supportedOpNames(),
        ...Type8.supportedOpNames(),
        ...External.supportedOpNames(),
    ]
}
