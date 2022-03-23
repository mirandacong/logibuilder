import {Builder} from '@logi/base/ts/common/builder'
import {
    FocusHierarchyPayloadBuilder,
    Payload,
    SetRefHeaderPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {Observable} from 'rxjs'

import {ActionType} from '../type'

import {Action as Base} from './base'

/**
 * This action is used for unlink table and share column set.
 * Sometime, a sub action should be executed after this unlink action.
 */
export interface Action extends Base {
    /**
     * The target tables to set referenceHeader to undefined.
     */
    readonly targets: readonly string[]
    /**
     * The hierarchy action exected after unlinking. Use this field to make
     * unlink and the hierarchy action in one undo/redo.
     */
}

class ActionImpl implements Action {
    public targets!: readonly string[]
    public actionType = ActionType.UNLINK

    public getPayloads():
        readonly Payload[] | Observable<readonly Payload[]> {
        const payloads: Payload[] = []
        this.targets.forEach((uuid: string): void => {
            const p = new SetRefHeaderPayloadBuilder()
                .uuid(uuid)
                .referenceHeader(undefined)
                .build()
            const focus = new FocusHierarchyPayloadBuilder().uuid(uuid).build()
            payloads.push(p, focus)
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

    public targets(targets: readonly string[]): this {
        this.getImpl().targets = targets
        return this
    }

    protected get daa(): readonly string[] {
        return ActionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['targets']
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

export function assertIsAction(value: unknown): asserts value is Action {
    if (!(value instanceof ActionImpl))
        throw Error('Not a Action!')
}
