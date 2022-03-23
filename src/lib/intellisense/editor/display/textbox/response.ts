import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'

import {EditorDisplayUnit} from './unit'
import {UnitType} from './unit_type'

/**
 * Inform the frontend the diplay message of the textbox
 */
export interface EditorResponse {
    readonly node: Readonly<Node>
    /**
     * The content showing in the textbox
     */
    readonly content: readonly EditorDisplayUnit[]
    /**
     * The cursor end offset.
     */
    readonly endOffset: number
    /**
     * The cursor start offset.
     */
    readonly startOffset: number
    getExpression(): string
}

class EditorResponseImpl implements Impl<EditorResponse> {
    public node!: Readonly<Node>
    public content: readonly EditorDisplayUnit[] = []
    public endOffset!: number
    public startOffset!: number
    public getExpression(): string {
        const result: string[] = []
        this.content.forEach((unit: EditorDisplayUnit): void => {
            if (unit.tags.includes(UnitType.READ_BUFFER)
                && unit.buffer !== undefined)
                result.push(unit.buffer)
            else
                result.push(unit.content)
        })
        return result.join('')
    }
}

export class EditorResponseBuilder extends
    Builder<EditorResponse, EditorResponseImpl> {
    public constructor(obj?: Readonly<EditorResponse>) {
        const impl = new EditorResponseImpl()
        if (obj)
            EditorResponseBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    public content(content: readonly EditorDisplayUnit[]): this {
        this.getImpl().content = content
        return this
    }

    public endOffset(endOffset: number): this {
        this.getImpl().endOffset = endOffset
        return this
    }

    public startOffset(startOffset: number): this {
        this.getImpl().startOffset = startOffset
        return this
    }

    protected get daa(): readonly string[] {
        return EditorResponseBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = [
        'startOffset',
        'endOffset',
        'content',
    ]
}

export function isEditorResponse(obj: object): obj is EditorResponse {
    return obj instanceof EditorResponseImpl
}
