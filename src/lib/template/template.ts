import {Builder} from '@logi/base/ts/common/builder'
import {Node, NodeType} from '@logi/src/lib/hierarchy/core'

/**
 * The template type.
 *
 * ROW_SET: All the nodes of template are row.
 * COLUMN_SET: All the nodes of template are column.
 * TABLE: There is only one node in nodes of template, and the type of node is
 * table.
 */
// tslint:disable-next-line: const-enum
export enum Type {
    UNKNOWN,
    TABLE,
    SHEET,
}

export interface Template {
    /**
     * The name of the template, actually it is a proxy of node.name.
     */
    readonly name: string
    readonly node: Readonly<Node>
    readonly type: Type
}

class TemplateImpl implements Template {
    public node!: Readonly<Node>

    public get name(): string {
        return this.node.name
    }

    public get type(): Type {
        if (this.node.nodetype === NodeType.SHEET)
            return Type.TABLE
        if (this.node.nodetype === NodeType.BOOK)
            return Type.SHEET
        return Type.UNKNOWN
    }
}

export class TemplateBuilder
    extends Builder<Template, TemplateImpl> {
    public constructor(obj?: Readonly<Template>) {
        const impl = new TemplateImpl()
        if (obj)
            TemplateBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['node']
    protected get daa(): readonly string[] {
        return TemplateBuilder.__DAA_PROPS__
    }
}

export function isTemplate(obj: unknown): obj is Template {
    return obj instanceof TemplateImpl
}
