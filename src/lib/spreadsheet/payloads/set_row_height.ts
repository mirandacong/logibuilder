import {Builder, SpreadsheetPayload} from './base'

export interface SetRowHeightPayload extends SpreadsheetPayload {
    readonly rol: number
    readonly height: number
}

class SetRowHeightPayloadImpl
    extends SpreadsheetPayload implements SetRowHeightPayload {
    public rol!: number
    public height!: number
}

export class SetRowHeightPayloadBuilder
    extends Builder<SetRowHeightPayload, SetRowHeightPayloadImpl> {
    public constructor(obj?: Readonly<SetRowHeightPayload>) {
        const impl = new SetRowHeightPayloadImpl()
        if (obj)
            SetRowHeightPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public rol(rol: number): this {
        this.getImpl().rol = rol
        return this
    }

    public height(height: number): this {
        this.getImpl().height = height
        return this
    }

    protected get daa(): readonly string[] {
        return SetRowHeightPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'rol',
        'height',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetRowHeightPayload(
    value: unknown,
): value is SetRowHeightPayload {
    return value instanceof SetRowHeightPayloadImpl
}
