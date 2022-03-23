import {Injector} from '@angular/core'
import {Title as HierarchyTitle} from '@logi/src/lib/hierarchy/core'
import {getLargestIndex} from '@logi/src/web/global/api/hierarchy'

import {Base} from './node'

let TITLE_NAME_IDENTIFIER = 1
const TITLE_NAME = 'Title'
/**
 * title base class.
 */
export class Title extends Base {
    public constructor(public readonly injector: Injector) {
        super(injector)
    }
    public node!: Readonly<HierarchyTitle>

    /**
     * add child with name 'title1', 'title2'..
     */
    public addChild(index = this.node.tree.length): void {
        this.collapse = false
        TITLE_NAME_IDENTIFIER = getLargestIndex(this.node.tree, TITLE_NAME) + 1
        const name = TITLE_NAME + TITLE_NAME_IDENTIFIER
        const action = this.getAddChildAction(this.nodeType.TITLE, name, index)
        this._studioApiSvc.handleAction(action)
    }
}
