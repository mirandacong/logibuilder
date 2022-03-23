import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    SetSourcePayload,
    SetSourcePayloadBuilder,
    SourcePayload,
} from '@logi/src/lib/api/payloads'
import {ManualSourceBuilder} from '@logi/src/lib/source'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Argument {
    readonly row: string
    readonly col: string
    readonly value: string | number
}

class ArgumentImpl implements Impl<Argument> {
    public row!: string
    public col!: string
    public value!: string | number
}

export class ArgumentBuilder extends Builder<Argument, ArgumentImpl> {
    public constructor(obj?: Readonly<Argument>) {
        const impl = new ArgumentImpl()
        if (obj)
            ArgumentBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public row(row: string): this {
        this.getImpl().row = row
        return this
    }

    public col(col: string): this {
        this.getImpl().col = col
        return this
    }

    public value(value: string | number): this {
        this.getImpl().value = value
        return this
    }

    protected get daa(): readonly string[] {
        return ArgumentBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'col',
        'row',
        'value',
    ]
}

export function isArgument(value: unknown): value is Argument {
    return value instanceof ArgumentImpl
}

export function assertIsArgument(value: unknown): asserts value is Argument {
    if (!(value instanceof ArgumentImpl))
        throw Error('Not a Argument!')
}

export interface Action extends Base {
    readonly args: readonly Argument[]
}

class ActionImpl implements Action {
    public args: readonly Argument[] = []
    public actionType = ActionType.SET_SOURCE
    public getPayloads(): readonly SourcePayload[] {
        return this.args.map((arg: Argument): SetSourcePayload => {
            // tslint:disable-next-line: no-type-assertion
            const source = new ManualSourceBuilder().value(arg.value).build()
            return new SetSourcePayloadBuilder()
                .row(arg.row)
                .col(arg.col)
                .source(source)
                .build()
        })
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public args(args: readonly Argument[]): this {
        this.getImpl().args = args
        return this
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
