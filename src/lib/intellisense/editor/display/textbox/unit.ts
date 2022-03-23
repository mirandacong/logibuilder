import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {HoverInfo, HoverInfoBuilder, Type as HoverInfoType} from '../hover_info'

import {UnitType} from './unit_type'

/**
 * Indicate the render unit in the frontend.
 *
 * We accept it from the frontend and emit it to tell how editor should display.
 */
export interface EditorDisplayUnit {
    readonly tags: readonly UnitType[]
    /**
     * Indicate the content of this unit if should be treated disassembly.
     */
    readonly indivisible: boolean
    readonly content: string
    /**
     * A place to store some information. Only used in intellisense.
     */
    readonly buffer: string
    /**
     * The message when mouse hovers this unit.
     */
    readonly hoverInfo: HoverInfo
}

class EditorDisplayUnitImpl implements Impl<EditorDisplayUnit> {
    public tags: readonly UnitType[] = []
    public indivisible = false
    public content!: string
    public buffer = ''
    public hoverInfo = new HoverInfoBuilder()
        .message('')
        .type(HoverInfoType.UNKONWN)
        .build()
}

export class EditorDisplayUnitBuilder extends
    Builder<EditorDisplayUnit, EditorDisplayUnitImpl> {
    public constructor(obj?: Readonly<EditorDisplayUnit>) {
        const impl = new EditorDisplayUnitImpl()
        if (obj)
            EditorDisplayUnitBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public tags(tags: readonly UnitType[]): this {
        this.getImpl().tags = tags
        return this
    }

    public indivisible(indivisible: boolean): this {
        this.getImpl().indivisible = indivisible
        return this
    }

    public content(content: string): this {
        this.getImpl().content = content
        return this
    }

    public buffer(buffer: string): this {
        this.getImpl().buffer = buffer
        return this
    }

    public hoverInfo(hoverInfo: HoverInfo): this {
        this.getImpl().hoverInfo = hoverInfo
        return this
    }

    protected get daa(): readonly string[] {
        return EditorDisplayUnitBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['content']
}

export function isEditorDisplayUnit(obj: unknown): obj is EditorDisplayUnit {
    return obj instanceof EditorDisplayUnitImpl
}
