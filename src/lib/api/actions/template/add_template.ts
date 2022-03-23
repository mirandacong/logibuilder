import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    AddTemplatePayloadBuilder,
    StdHeaderPayload,
} from '@logi/src/lib/api/payloads'
import {SheetBuilder, TableBuilder} from '@logi/src/lib/hierarchy/core'
import {TemplateBuilder, Type} from '@logi/src/lib/template'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    readonly name: string
    readonly type: Type
}

class ActionImpl implements Impl<Action> {
    public name!: string
    public type!: Type
    public actionType = ActionType.ADD_TEMPLATE
    public getPayloads(): readonly StdHeaderPayload[] {
        const templateBuilder = new TemplateBuilder()
        if (this.type === Type.TABLE)
            templateBuilder.node(new SheetBuilder()
                .name(this.name)
                .tree([new TableBuilder().name('').build()])
                .build())
        else
            return []
        const template = templateBuilder.build()
        return [new AddTemplatePayloadBuilder().template(template).build()]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['name', 'type']
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
