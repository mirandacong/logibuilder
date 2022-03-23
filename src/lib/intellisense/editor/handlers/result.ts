import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node} from '@logi/src/lib/hierarchy/core'

import {Status} from '../status/entry'

export type Action = (curr: Status, options?: unknown) => HandleResult

export interface HandleResult {
    readonly newStatus: Status
    /**
     * Signifying if this event result should cause intellisense suggestion.
     */
    readonly intellisense: boolean
    /**
     * Signifying if this event result should show the panel.
     */
    readonly showPanel: boolean
    /**
     * Signifying if this event result should show function usage.
     */
    readonly showFuncUsage: boolean
    /**
     * The directive that controller should do.
     */
    readonly action: ControllerAction
    /**
     * If the text status of `newStatus` should be stored for later
     * `UNDO` or `REDO`.
     */
    readonly txtPush: boolean
}

class HandleResultImpl implements Impl<HandleResult> {
    public newStatus!: Status
    public intellisense = false
    public showPanel = false
    public showFuncUsage = false
    public action = new ControllerActionBuilder()
        .type(ControllerActionType.NONE)
        .build()
    public txtPush = false
}

export class HandleResultBuilder extends
    Builder<HandleResult, HandleResultImpl> {
    protected get daa(): readonly string[] {
        return HandleResultBuilder.__DAA_PROPS__
    }

    public constructor(obj?: Readonly<HandleResult>) {
        const impl = new HandleResultImpl()
        if (obj)
            HandleResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public newStatus(newStatus: Status): this {
        this.getImpl().newStatus = newStatus
        return this
    }

    public intellisense(intellisense: boolean): this {
        this.getImpl().intellisense = intellisense
        return this
    }

    public showPanel(showPanel: boolean): this {
        this.getImpl().showPanel = showPanel
        return this
    }

    public showFuncUsage(showFuncUsage: boolean): this {
        this.getImpl().showFuncUsage = showFuncUsage
        return this
    }

    public directive(d: ControllerAction): this {
        this.getImpl().action = d
        return this
    }

    public txtPush(txtPush: boolean): this {
        this.getImpl().txtPush = txtPush
        return this
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['newStatus']

    protected preBuildHook(): void {
        if (!this.getImpl().showPanel)
            this.getImpl().newStatus.panelStatus.reset()
    }
}

export function isHandleResult(obj: unknown): obj is HandleResult {
    return obj instanceof HandleResultImpl
}

export const enum ControllerActionType {
    NONE,
    BLUR,
    // Tell the controller to make a CUT DirectiveResponse to frontend.
    CUT,

    // Tell the controller to make a COPY DirectiveResponse to frontend.
    COPY,

    // Tell the controller to make a SAVE DirectiveResponse to frontend.
    SAVE,
    // Tell the controller to make a SKIP DirectiveResponse to frontend.
    SKIP_LAST,
    SKIP_NEXT,
    // Such as listening `tab`, tell the controller to make a DirectiveResponse
    // to frontend, frontend should skip current node, focus the home of next
    // node.
    SKIP_BACK,

    // Tell the controller to make a TRACE DirectiveResponse to frontend.
    TRACE,

    // Tell the controller to undo the text status.
    CONTROLLER_UNDO,

    // Tell the controller to redo the text status.
    CONTROLLER_REDO,
}

/**
 * To tell the controller to do some actions.
 */
export interface ControllerAction {
    readonly type: ControllerActionType
    readonly data?: string | readonly Readonly<Node>[]
}

class ControllerActionImpl implements Impl<ControllerAction> {
    public type!: ControllerActionType
    public data?: string | readonly Readonly<Node>[]
}

export class ControllerActionBuilder extends
    Builder<ControllerAction, ControllerActionImpl> {
    public constructor(obj?: Readonly<ControllerAction>) {
        const impl = new ControllerActionImpl()
        if (obj)
            ControllerActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public type(type: ControllerActionType): this {
        this.getImpl().type = type
        return this
    }

    public data(data: string | readonly Readonly<Node>[]): this {
        this.getImpl().data = data
        return this
    }

    protected get daa(): readonly string[] {
        return ControllerActionBuilder.__DAA_PROPS__
    }

    protected static readonly __DAA_PROPS__: readonly string[] = ['type']
}

export function isControllerAction(obj: unknown): obj is ControllerAction {
    return obj instanceof ControllerActionImpl
}
