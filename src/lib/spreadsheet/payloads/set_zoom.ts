import {Builder, SpreadsheetPayload} from './base'

export interface SetZoomPayload extends SpreadsheetPayload {
    readonly zoom: number
}

class SetZoomPayloadImpl extends SpreadsheetPayload implements SetZoomPayload {
    public zoom!: number
}

export class SetZoomPayloadBuilder
    extends Builder<SetZoomPayload, SetZoomPayloadImpl> {
    public constructor(obj?: Readonly<SetZoomPayload>) {
        const impl = new SetZoomPayloadImpl()
        if (obj)
            SetZoomPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public zoom(zoom: number): this {
        this.getImpl().zoom = zoom
        return this
    }

    protected get daa(): readonly string[] {
        return SetZoomPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'zoom',
        ...Builder.__DAA_PROPS__,
    ]
}

export function isSetZoomPayload(value: unknown): value is SetZoomPayload {
    return value instanceof SetZoomPayloadImpl
}
