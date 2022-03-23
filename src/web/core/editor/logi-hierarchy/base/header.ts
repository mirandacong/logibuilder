import {Injector} from '@angular/core'
import {RemoveNodesActionBuilder} from '@logi/src/lib/api'
import {ColumnBlock, Node, NodeType} from '@logi/src/lib/hierarchy/core'

import {Base} from './node'

/**
 * Base header class.
 */
export class Header extends Base {
    public constructor(public readonly injector: Injector) {
        super(injector)
    }
    public node!: Readonly<ColumnBlock>
    public stub = ''
    /**
     * If header is shared column set, should also add child to referencetable.
     */
    // tslint:disable-next-line: no-optional-parameter
    public addChild(type: NodeType, index?: number): void {
        const action = this.getAddChildAction(type, '', index)
        this._studioApiSvc.handleAction(action)
    }

    /**
     * If header is shared column set, should remove child in reference table.
     */
    public removeChild(child: Readonly<Node>): void {
        const action = new RemoveNodesActionBuilder()
            .targets([child.uuid])
            .build()
        this._studioApiSvc.handleAction(action)
    }
}
