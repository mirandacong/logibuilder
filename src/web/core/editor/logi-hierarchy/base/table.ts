import {Injector} from '@angular/core'
import {SetHeaderStubActionBuilder} from '@logi/src/lib/api'
import {NodeType, Table as HierarchyTable} from '@logi/src/lib/hierarchy/core'

import {Base} from './node'

/**
 * Table base class.
 */
export class Table extends Base {
    public constructor(public readonly injector: Injector) {
        super(injector)
    }
    public node!: Readonly<HierarchyTable>

    /**
     * Common add table child function.
     */
    public addChild(
        type: NodeType,
        // tslint:disable-next-line: no-optional-parameter
        index?: number,
    ): void {
        this.collapse = false
        const action = this.getAddChildAction(type, '', index)
        if (action === undefined)
            return
        const filterType = [NodeType.COLUMN, NodeType.COLUMN_BLOCK]
        if (!filterType.includes(type)) {
            this._studioApiSvc.handleAction(action)
            return
        }
        this._studioApiSvc.handleAction(action)
    }

    /**
     * common table stub change function.
     */
    public tableStubChange(stub: string): void {
        if (!this.isTable(this.node) || stub === this.node.headerStub)
            return
        const action = new SetHeaderStubActionBuilder()
            .target(this.node.uuid)
            .stub(stub)
            .build()
        this._studioApiSvc.handleAction(action)
    }
}
