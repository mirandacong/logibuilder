import {Payload as Base, PayloadType} from '../payload'

export class Payload implements Base {
    public payloadType!: PayloadType
}

export function isPayload(obj: unknown): obj is Payload {
    return obj instanceof Payload
}
