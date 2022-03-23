import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

export const enum Type {
    UNKNOWN,
    SUCCESS,
    WARNING,
    ERROR,
    INFO,
}

export interface Message {
    readonly type: Type
    readonly main: string
    readonly secondary: string
}

class MessageImpl implements Impl<Message> {
    public type!: Type
    public main!: string
    public secondary = ''
}

export class MessageBuilder extends Builder<Message, MessageImpl> {
    public constructor(obj?: Readonly<Message>) {
        const impl = new MessageImpl()
        if (obj)
            MessageBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: Type): this {
        this.getImpl().type = type
        return this
    }

    public main(main: string): this {
        this.getImpl().main = main
        return this
    }

    public secondary(secondary: string): this {
        this.getImpl().secondary = secondary
        return this
    }

    protected get daa(): readonly string[] {
        return MessageBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'type',
        'main',
    ]
}

export function isMessage(value: unknown): value is Message {
    return value instanceof MessageImpl
}

export function assertIsMessage(value: unknown): asserts value is Message {
    if (!(value instanceof MessageImpl))
        throw Error('Not a Message!')
}
