import {Builder} from '@logi/base/ts/common/builder'
import {FormulaBearer} from '@logi/src/lib/hierarchy/core'

/**
 * Use in `load template` process to represent the refenreces of each
 * formulabearer would match any formulabearer.
 */
export interface MatchInfo {
    /**
     * The text of `refCst` in the expression of formulabearer.
     */
    readonly refNodePath: string
    readonly matchedFbs: readonly Readonly<FormulaBearer>[]
    /**
     * The default selected formulabearer.
     */
    readonly selectedNode?: Readonly<FormulaBearer>,
}

class MatchInfoImpl implements MatchInfo {
    public refNodePath!: string
    public matchedFbs: readonly Readonly<FormulaBearer>[] = []
    public selectedNode?: Readonly<FormulaBearer>
}

export class MatchInfoBuilder extends Builder<MatchInfo, MatchInfoImpl> {
    public constructor(obj?: Readonly<MatchInfo>) {
        const impl = new MatchInfoImpl()
        if (obj)
            MatchInfoBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public refNodePath(refNodePath: string): this {
        this.getImpl().refNodePath = refNodePath
        return this
    }

    public refFbs(refFbs: readonly Readonly<FormulaBearer>[]): this {
        this.getImpl().matchedFbs = refFbs
        return this
    }

    public selectedNode(selectedNode: Readonly<FormulaBearer>): this {
        this.getImpl().selectedNode = selectedNode
        return this
    }
}
