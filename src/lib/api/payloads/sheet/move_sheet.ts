import {Builder} from '@logi/base/ts/common/builder'

import {PayloadType} from '../payload'

import {SheetPayload} from './payload'

export interface MoveSheetPayload extends SheetPayload {
    readonly name: string
    readonly hierarchyPos?: number
    readonly position: number
    readonly oriPos: number
}

class MoveSheetPayloadImpl
    extends SheetPayload implements MoveSheetPayload {
    public name!: string
    public hierarchyPos?: number
    public position!: number
    public oriPos!: number
    public payloadType = PayloadType.MOVE_SHEET
}

export class MoveSheetPayloadBuilder extends
    Builder<MoveSheetPayload, MoveSheetPayloadImpl> {
    public constructor(obj?: Readonly<MoveSheetPayload>) {
        const impl = new MoveSheetPayloadImpl()
        if (obj)
            MoveSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public hierarchyPos(hierarchyPos?: number): this {
        this.getImpl().hierarchyPos = hierarchyPos
        return this
    }

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }

    public oriPos(oriPos: number): this {
        this.getImpl().oriPos = oriPos
        return this
    }

    protected get daa(): readonly string[] {
        return MoveSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'position',
        'oriPos',
    ]
}

export function isMoveSheetPayload(value: unknown): value is MoveSheetPayload {
    return value instanceof MoveSheetPayloadImpl
}
