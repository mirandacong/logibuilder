import {
    BatchSetTypeActionBuilder,
    SetSliceNameActionBuilder,
} from '@logi/src/lib/api'
import {
    FormulaBearer,
    SliceExpr,
    Type as TagType,
} from '@logi/src/lib/hierarchy/core'
import {Target} from '@logi/src/lib/intellisense'

import {Base} from './node'
/**
 * Base slice class.
 */
export class Slice extends Base {
    public node!: Readonly<FormulaBearer>
    public slice!: Readonly<SliceExpr>

    /**
     * Change slice name function.
     */
    public changeName(name: string): void {
        if (this.slice.name === name)
            return
        const action = new SetSliceNameActionBuilder()
            .name(name)
            .target(this.node.uuid)
            .slice(this.slice)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    // tslint:disable-next-line: prefer-function-over-method
    public renderTarget(target: Target): string {
        const defaultContent = `<span>${target.content}</span>`
        const matched = Array.from(target.matchedMap.values())
        if (matched.length === 0)
            return defaultContent
        return target.content
            .split('')
            .map((c: string, i: number): string => {
                if (matched.includes(i))
                    return `<span class='matched-part'>${c}</span>`
                return c
            })
            .join('')
    }

    public setSliceTagType(type: TagType): void {
        const infos = this.nodeFocusSvc.getSelInfos()
        const targets = infos.map((
            info,
        ): [string, string | undefined] => [info.nodeId, info.slice?.uuid])
        const action = new BatchSetTypeActionBuilder()
            .targets(targets)
            .type(type)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public onTagMenuMouseDown(e: MouseEvent): void {
        const isSelected = this.nodeFocusSvc
            .isSelected(this.node.uuid, this.slice)
        if (isSelected)
            e.stopPropagation()
    }
}
