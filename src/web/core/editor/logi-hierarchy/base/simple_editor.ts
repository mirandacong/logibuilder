import {
    SetExpressionActionBuilder,
    SetSliceExprActionBuilder,
} from '@logi/src/lib/api'
import {FormulaBearer, SliceExpr} from '@logi/src/lib/hierarchy/core'

import {Base} from './node'

// tslint:disable-next-line: comment-for-export-and-public
export class SimpleEditor extends Base {
    public node!: Readonly<FormulaBearer>
    public sliceExpr?: Readonly<SliceExpr>
    // tslint:disable-next-line: comment-for-export-and-public
    public updateExpression(): void {
        const newExpression = this.expression
        const oldExpression = this.sliceExpr ? this.sliceExpr.expression :
            this.node.expression
        if (newExpression === oldExpression)
            return
        const builder = this.sliceExpr === undefined
            ? new SetExpressionActionBuilder()
            : new SetSliceExprActionBuilder().slice(this.sliceExpr)
        const action = builder
            .target(this.node.uuid)
            .expression(newExpression)
            .build()
        this._studioApiSvc.handleAction(action)
    }
    protected expression = ''
}
