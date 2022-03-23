// tslint:disable: limit-indent-for-method-in-class
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {
    AddLabelPayloadBuilder,
    HierarchyPayload,
    RemoveLabelPayloadBuilder,
    SetSliceNamePayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    filterLex,
    FilterToken,
    FilterTokenType,
} from '@logi/src/lib/dsl/semantic'
import {
    FormulaBearer,
    isFormulaBearer,
    isTable,
    Label,
    SliceExpr,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../../type'
import {Action as Base} from '../base'

/**
 * Rename a label in tables, and slice names will be renamed too.
 */
export interface Action extends Base {
    // The uuid of the formulabearers that are prepared to rename label.
    readonly formulabearers: readonly string[]
    readonly oldLabel: Label
    readonly newLabel: Label
}

class ActionImpl implements Impl<Action> {
    public formulabearers: readonly string[] = []
    public oldLabel!: Label
    public newLabel!: Label
    public actionType = ActionType.RENAME_LABEL
    // tslint:disable-next-line: max-func-body-length
    public getPayloads(
        service: Readonly<EditorService>,
    ): readonly HierarchyPayload[] {
        const fbNodes = this.formulabearers
            .map(fb => service.bookMap.get(fb))
            .filter(isFormulaBearer)
        const payloads: HierarchyPayload[] = []
        fbNodes.forEach((fb: Readonly<FormulaBearer>): void => {
            const table = fb.getTable()
            if (!isTable(table))
                return
            const idx = fb.labels.indexOf(this.oldLabel)
            if (idx < 0)
                return
            const rmLabel = new RemoveLabelPayloadBuilder()
                .uuid(fb.uuid)
                .label(this.oldLabel)
                .build()
            payloads.push(rmLabel)
            const addLabel = new AddLabelPayloadBuilder()
                .uuid(fb.uuid)
                .label(this.newLabel)
                .position(idx)
                .build()
            payloads.push(addLabel)
            const header = table.getFbHeader(fb)
            header.forEach((r: Readonly<FormulaBearer>): void => {
                if (r.sliceExprs.length === 0)
                    return
                r.sliceExprs.forEach((slice: SliceExpr, i: number): void => {
                    const tokens = filterLex(slice.name)
                    let changed = false
                    const pieces: string[] = []
                    tokens.forEach((t: FilterToken): void => {
                        if (t.type !== FilterTokenType.VALUE ||
                            t.image !== this.oldLabel) {
                            pieces.push(t.image)
                            return
                        }
                        pieces.push(this.newLabel)
                        changed = true
                    })
                    if (!changed)
                        return
                    const newSliceName = pieces.join('')
                    const setSliceName = new SetSliceNamePayloadBuilder()
                        .uuid(r.uuid)
                        .index(i)
                        .name(newSliceName)
                        .build()
                    payloads.push(setSliceName)
                })
            })
        })

        return payloads
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public formulabearers(formulabearers: readonly string[]): this {
        this.getImpl().formulabearers = formulabearers
        return this
    }

    public oldLabel(oldLabel: Label): this {
        this.getImpl().oldLabel = oldLabel
        return this
    }

    public newLabel(newLabel: Label): this {
        this.getImpl().newLabel = newLabel
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'newLabel',
        'oldLabel',
    ]
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
