import {Payload, PayloadType} from '../payload'

export abstract class SheetPayload implements Payload {
    public abstract payloadType: PayloadType
}

export function isSheetPayload(obj: unknown): obj is SheetPayload {
    return obj instanceof SheetPayload
}
