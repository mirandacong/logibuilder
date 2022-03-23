import {Injector} from '@angular/core'
import {isString} from '@logi/base/ts/common/type_guard'
import {SetNameActionBuilder} from '@logi/src/lib/api'
import {isHTMLElement} from '@logi/src/web/base/utils'

import {Formulabearer} from './formulabearer'
export class Separator extends Formulabearer {
    public constructor(
        public readonly injector: Injector,
    ) {
        super(injector)
    }
    public nameChange(e: FocusEvent): void {
        const target = e.target
        if (!isHTMLElement(target))
            return
        const newName = target.textContent
        if (!isString(newName) || newName === this.node.name)
            return
        const action = new SetNameActionBuilder()
            .name(newName)
            .target(this.node.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }
}
