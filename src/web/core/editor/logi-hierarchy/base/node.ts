import {ChangeDetectorRef, Injector} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {
    AddChildAction,
    AddChildActionBuilder,
    RemoveNodesActionBuilder,
    SetNameActionBuilder,
} from '@logi/src/lib/api'
import {
    isColumn,
    isColumnBlock,
    isNode,
    isRow,
    isRowBlock,
    isSliceExpr,
    isTable,
    isTitle,
    Node,
    NodeType,
    Type as TagType,
} from '@logi/src/lib/hierarchy/core'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {NodeExpandService} from '@logi/src/web/core/editor/node-expand'
import {
    FocusType,
    NodeFocusService,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api/service'
import {ReadonlyService} from '@logi/src/web/global/readonly'
import {DialogService} from '@logi/src/web/ui/dialog'
import {NotificationService} from '@logi/src/web/ui/notification'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {dispatchContextmenu} from './lib'
/**
 * Base class of logi-hierarchy components.
 */
export abstract class Base {
    // tslint:disable-next-line: max-func-body-length
    public constructor(public readonly injector: Injector) {
        this._studioApiSvc = this.injector.get(StudioApiService)
        this.nodeFocusSvc = this.injector.get(NodeFocusService)
        this.nodeEditSvc = this.injector.get(NodeEditService)
        this.notificationSvc = this.injector.get(NotificationService)
        this._readonlySvc = this.injector.get(ReadonlyService)
        this.nodeExpandSvc = this.injector.get(NodeExpandService)
        this.dialogSvc = this.injector.get(DialogService)
        this.dialog = injector.get(MatDialog)
        this.cd = injector.get(ChangeDetectorRef)
        this.listenReadonly()
    }
    public node!: Readonly<Node>
    public nodeType = NodeType
    public tagType = TagType
    public focusType = FocusType
    public isTitle = isTitle
    public isRow = isRow

    public isRowBlock = isRowBlock
    public isColumn = isColumn

    public isColumnBlock = isColumnBlock
    public isTable = isTable
    public dispatchContextmenu = dispatchContextmenu
    public name = ''
    public collapse = false
    public readonly = false
    public destroyed$ = new Subject<void>()
    public readonly dialog: MatDialog
    public readonly _studioApiSvc: StudioApiService
    public readonly _readonlySvc: ReadonlyService
    public cd: ChangeDetectorRef

    /**
     * Common rename function to rename nodes.
     */
    public renameNode (): void {
        const name = this.name
        if (this.node.name === name)
            return
        const action = new SetNameActionBuilder()
            .name(name)
            .target(this.node.uuid)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    public listenReadonly (): void {
        this._readonlySvc
            .getReadonly()
            .pipe(takeUntil(this.destroyed$))
            .subscribe(r => {
                if (r === undefined)
                    return
                this.readonly = r
                this.cd.markForCheck()
            })
    }

    public expandNodeState (): void {
        this.nodeExpandSvc
            .listenStateChange()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((uuids: string[]): void => {
                if (!this.collapse || !uuids.includes(this.node.uuid))
                    return
                this.collapse = false
                this.cd.markForCheck()
            })
    }

    /**
     * Common collapse control function.
     */
    public collapseNode (collapse: boolean, e: Event): void {
        this.collapse = collapse
        e.stopPropagation()
        const config = new SelConfigBuilder()
            .multiSelect(false)
            .isExpand(!collapse)
            .build()
        this.nodeFocusSvc.setSelNodes([this.node.uuid], undefined, config)
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention
    public trackByFnReturnItem (_: number, item: unknown): unknown {
        if (isNode(item) || isSliceExpr(item))
            return item.uuid
        return item
    }

    // tslint:disable-next-line: ter-max-len
    // tslint:disable-next-line: prefer-function-over-method ext-variable-name naming-convention
    public trackByFnReturnIndex (index: number, _: unknown): number {
        return index
    }

    /**
     * Return a `addChildPayload` by type, index and name.
     */
    public getAddChildAction (
        type: NodeType,
        name = '',
        // tslint:disable-next-line: no-optional-parameter
        index?: number,
    ): Readonly<AddChildAction> {
        this.collapse = false
        return new AddChildActionBuilder()
            .target(this.node.uuid)
            .name(name)
            .type(type)
            .position(index)
            .build()
    }

    /**
     * Common remove child action.
     */
    public removeChild (child: Readonly<Node>): void {
        const action = new RemoveNodesActionBuilder()
            .targets([child.uuid])
            .build()
        this._studioApiSvc.handleAction(action)
    }

    protected nodeFocusSvc: NodeFocusService
    protected nodeEditSvc: NodeEditService

    protected notificationSvc: NotificationService
    protected nodeExpandSvc: NodeExpandService
    protected dialogSvc: DialogService
}
