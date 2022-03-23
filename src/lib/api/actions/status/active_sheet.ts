import {Builder} from '@logi/base/ts/common/builder'
import {Payload, SetActiveSheetPayloadBuilder} from '@logi/src/lib/api/payloads'

import {Action as Base} from '../action'
import {ActionType} from '../type'

export interface Action extends Base {
    /**
     * sheet name
     */
    readonly activeSheet: string
}

class ActionImpl implements Action {
    public activeSheet!: string
    public actionType = ActionType.SET_ACTIVE_SHEET
    public getPayloads(): readonly Payload[] {
        return [new SetActiveSheetPayloadBuilder()
            .sheet(this.activeSheet)
            .build()]
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public activeSheet(activeSheet: string): this {
        this.getImpl().activeSheet = activeSheet
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['activeSheet']
}

export function isAction(obj: unknown): obj is Action {
    return obj instanceof ActionImpl
}
