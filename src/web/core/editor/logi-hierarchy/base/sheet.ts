// tslint:disable: limit-indent-for-method-in-class
import {ElementRef, Injector, ViewChild, Directive} from '@angular/core'
import {AddChildAction, AddChildActionBuilder} from '@logi/src/lib/api'
import {NodeType, Sheet as HierarchySheet} from '@logi/src/lib/hierarchy/core'
import {getLargestIndex} from '@logi/src/web/global/api/hierarchy'

import {Base} from './node'

export const enum AddType {
    UNKNOWN = '',
    TITLE = '添加标题',
    TABLE = '添加表格',
    TEMPALTE = '从库导入',
}

let TABLE_NAME_IDENTIFIER = 1
let TITLE_NAME_IDENTIFIER = 1
const TABLE_NAME = '表格'
const TITLE_NAME = '标题'

/**
 * Base sheet class.
 */
@Directive({selector: '[logi-sheet-directory]'})
export class Sheet extends Base {
    public constructor(
        public readonly injector: Injector) {
        super(injector)
    }
    public node!: Readonly<HierarchySheet>
    @ViewChild('container', {static: true})
    public container!: ElementRef<HTMLDivElement>

    // tslint:disable-next-line: max-func-body-length no-optional-parameter
    public addChild (type: AddType, index?: number): void {
        let action: Readonly<AddChildAction>
        switch (type) {
        case AddType.TITLE:
            TITLE_NAME_IDENTIFIER = getLargestIndex(this.node.tree, TITLE_NAME)
                    + 1
            const titleName = TITLE_NAME + TITLE_NAME_IDENTIFIER
            const titleAction = this
                .getAddChildAction(this.nodeType.TITLE, titleName, index)
            if (titleAction === undefined)
                return
            action = titleAction
            this._studioApiSvc.handleAction(action)
            break
        case AddType.TABLE:
            TABLE_NAME_IDENTIFIER = getLargestIndex(this.node.tree, TABLE_NAME)
                    + 1
            const name = TABLE_NAME + TABLE_NAME_IDENTIFIER
            action = new AddChildActionBuilder()
                .target(this.node.uuid)
                .name(name)
                .type(NodeType.TABLE)
                .position(index)
                .build()
            this._studioApiSvc.handleAction(action)
            break
        case AddType.TEMPALTE:
            break
        default:
            return
        }
        this.cd.markForCheck()
    }
}
