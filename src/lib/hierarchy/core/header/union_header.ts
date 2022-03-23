import {Builder} from '@logi/base/ts/common/builder'

import {Column} from '../column'

export interface UnionHeader {
    readonly unionCols: readonly Readonly<Column>[]
    /**
     * The original col mapping to the union col.
     */
    readonly toUnionCol: Map<string, Readonly<Column>>
    getOriginalCol(table: string, unionCol: string): string | undefined
    getOriginalCols(unionCol: string): readonly string[]
}

class UnionHeaderImpl implements UnionHeader {
    public unionCols!: readonly Readonly<Column>[]
    public toUnionCol!: Map<string, Readonly<Column>>
    /**
     * The union col => table => original col.
     */
    public toRelatedCols!: Map<string, Map<string, string>>
    public getOriginalCol(table: string, unionCol: string): string | undefined {
        const tableMap = this.toRelatedCols.get(unionCol)
        if (tableMap === undefined)
            return
        return tableMap.get(table)
    }

    public getOriginalCols(unionCol: string): readonly string[] {
        const tableMap = this.toRelatedCols.get(unionCol)
        if (tableMap === undefined)
            return []
        return Array.from(tableMap.values())
    }
}

export class UnionHeaderBuilder extends Builder<UnionHeader, UnionHeaderImpl> {
    public constructor(obj?: Readonly<UnionHeader>) {
        const impl = new UnionHeaderImpl()
        if (obj)
            UnionHeaderBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public unionCols(unionCols: readonly Readonly<Column>[]): this {
        this.getImpl().unionCols = unionCols
        return this
    }

    public toUnionCol(toUnionCol: Map<string, Readonly<Column>>): this {
        this.getImpl().toUnionCol = toUnionCol
        return this
    }

    public toRelatedCols(
        toRelatedCols: Map<string, Map<string, string>>,
    ): this {
        this.getImpl().toRelatedCols = toRelatedCols
        return this
    }

    protected get daa(): readonly string[] {
        return UnionHeaderBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'unionCols',
        'toUnionCol',
        'toRelatedCols',
    ]
}
