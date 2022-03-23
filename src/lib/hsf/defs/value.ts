import {Builder} from '@logi/base/ts/common/builder'
export interface Value {
    readonly sourceType: ValueSourceType
    readonly boolean?: boolean
    readonly error?: ValueError
    readonly number?: number
    readonly date?: Date
    readonly text?: string
    readonly stub?: Readonly<Uint8Array>
}

class ValueImpl implements Value {
    public sourceType = ValueSourceType.TYPE_UNSPECIFIED
    public boolean?: boolean
    public error?: ValueError
    public number?: number
    public date?: Date
    public text?: string
    public stub?: Readonly<Uint8Array>
}

export class ValueBuilder extends Builder<Value, ValueImpl> {
    public constructor(obj?: Readonly<Value>) {
        const impl = new ValueImpl()
        if (obj)
            ValueBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sourceType(sourceType: ValueSourceType): this {
        this.getImpl().sourceType = sourceType
        return this
    }

    public boolean(value: boolean): this {
        this.getImpl().boolean = value
        return this
    }

    public error(error: ValueError): this {
        this.getImpl().error = error
        return this
    }

    public number(value: number): this {
        this.getImpl().number = value
        return this
    }

    public date(date: Date): this {
        this.getImpl().date = date
        return this
    }

    public text(text: string): this {
        this.getImpl().text = text
        return this
    }

    public stub(stub: Readonly<Uint8Array>): this {
        this.getImpl().stub = stub
        return this
    }
}

export const enum ValueSourceType {
    TYPE_UNSPECIFIED = 0,
    MANUAL = 1,
    DATABASE = 2,
}

export const enum ValueError {
    ERROR_UNSPECIFIED = 0,
    E_NULL = 1,
    E_DIV0 = 2,
    E_VALUE = 3,
    E_REF = 4,
    E_NAME = 5,
    E_NUM = 7,
    E_NA = 8,
    E_GETTING_DATA = 9,
}
