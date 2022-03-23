import {Builder} from '@logi/base/ts/common/builder'
import {Sheet} from '@logi/src/lib/hierarchy/core'

import {PayloadType} from '../payload'

import {SheetPayload} from './payload'

export interface AddSheetPayload extends SheetPayload {
    readonly name: string
    readonly hierarchyPos: number
    readonly position: number
    readonly sheet: Readonly<Sheet>
}

class AddSheetPayloadImpl
    extends SheetPayload implements AddSheetPayload {
    public name!: string
    public hierarchyPos!: number
    public position!: number
    public sheet!: Readonly<Sheet>
    public payloadType = PayloadType.ADD_SHEET
}

export class AddSheetPayloadBuilder extends
    Builder<AddSheetPayload, AddSheetPayloadImpl> {
    public constructor(obj?: Readonly<AddSheetPayload>) {
        const impl = new AddSheetPayloadImpl()
        if (obj)
            AddSheetPayloadBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public hierarchyPos(hierarchyPos: number): this {
        this.getImpl().hierarchyPos = hierarchyPos
        return this
    }

    public position(position: number): this {
        this.getImpl().position = position
        return this
    }

    public sheet(sheet: Readonly<Sheet>): this {
        this.getImpl().sheet = sheet
        return this
    }

    protected get daa(): readonly string[] {
        return AddSheetPayloadBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'hierarchyPos',
        'position',
        'sheet',
    ]
}

export function isAddSheetPayload(value: unknown): value is AddSheetPayload {
    return value instanceof AddSheetPayloadImpl
}
