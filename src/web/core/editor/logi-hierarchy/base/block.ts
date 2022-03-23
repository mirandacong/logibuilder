import {Injector} from '@angular/core'
import {ColumnBlock, NodeType, RowBlock} from '@logi/src/lib/hierarchy/core'

import {Base} from './node'

export class Block extends Base {
    public constructor(
        public readonly injector: Injector) {
        super(injector)
    }
    public node!: Readonly<RowBlock | ColumnBlock>
    public collapse = false
    public addChild(
        type: NodeType,
        // tslint:disable-next-line: no-optional-parameter
        index?: number,
    ): void {
        const action = this.getAddChildAction(type, '', index)
        this._studioApiSvc.handleAction(action)
    }
}
