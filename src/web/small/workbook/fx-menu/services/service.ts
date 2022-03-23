import {Injectable} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {EditBarType, RenderActionBuilder} from '@logi/src/lib/api'
import {
    AddItem,
    ToolbarBtnType,
} from '@logi/src/web/core/editor/node-edit/add_list'
import {NodeEditService} from '@logi/src/web/core/editor/node-edit/service'
import {StudioApiService} from '@logi/src/web/global/api'
import {BehaviorSubject} from 'rxjs'

import {ForecastDialogComponent} from './forecast-dialog'
import {SumSnippetService} from './sum-dialog'

@Injectable()
/**
 * Top toolbar service.
 */
export class FxMenuService {
    public constructor(
        private readonly _studioApiSvc: StudioApiService,
        private readonly _sumSnippetSvc: SumSnippetService,
        private readonly _dialog: MatDialog,
        private readonly _nodeEditSvc: NodeEditService,
    ) { }
    // tslint:disable-next-line: ng-only-method-public-in-service
    public buttonIsOpen$ = new BehaviorSubject<ButtonType>(ButtonType.UNKNOWN)
    public clickToolbarBtn (type: ToolbarBtnType): void {
        switch (type) {
        case ToolbarBtnType.REFRESH:
            const action = new RenderActionBuilder().build()
            this._studioApiSvc.handleAction(action)
            break
        case ToolbarBtnType.LOAD_TEMPLATE:
            break
        case ToolbarBtnType.UNDO:
            this._nodeEditSvc.undo()
            break
        case ToolbarBtnType.REDO:
            this._nodeEditSvc.redo()
            break
        case ToolbarBtnType.CUT:
            this._nodeEditSvc.cut()
            break
        case ToolbarBtnType.COPY:
            this._nodeEditSvc.copy()
            break
        case ToolbarBtnType.PASTE:
            this._nodeEditSvc.paste()
            break
        case ToolbarBtnType.REMOVE:
            this._nodeEditSvc.remove()
            break
        case ToolbarBtnType.UP:
            this._nodeEditSvc.upOrDown(true)
            break
        case ToolbarBtnType.DOWN:
            this._nodeEditSvc.upOrDown(false)
            break
        case ToolbarBtnType.LEVEL_UP:
            this._nodeEditSvc.levelUpOrDown(true)
            break
        case ToolbarBtnType.LEVEL_DOWN:
            this._nodeEditSvc.levelUpOrDown(false)
            break
        default:
            return
        }
    }

    public updateStatus (
        items: readonly AddItem[],
        nodeIds: readonly string[],
    ): void {
        let editBarType: EditBarType
        // tslint:disable-next-line: max-func-body-length
        items.forEach((nodeBtn: AddItem): void => {
            switch (nodeBtn.type) {
            case ToolbarBtnType.REMOVE:
                editBarType = EditBarType.REMOVE_NODE
                break
            case ToolbarBtnType.LEVEL_UP:
                editBarType = EditBarType.LEVEL_UP
                break
            case ToolbarBtnType.LEVEL_DOWN:
                editBarType = EditBarType.LEVEL_DOWN
                break
            case ToolbarBtnType.UP:
                editBarType = EditBarType.MOVE_UP
                break
            case ToolbarBtnType.DOWN:
                editBarType = EditBarType.MOVE_DOWN
                break
            case ToolbarBtnType.SUM:
                editBarType = EditBarType.GET_SUM
                break
            case ToolbarBtnType.FORECAST:
                editBarType = EditBarType.SPLIT_FORECAST
                break
            case ToolbarBtnType.BASE_HISTORICAL:
                editBarType = EditBarType.RATE_FORECAST
                break
            case ToolbarBtnType.GROWTH_RATE:
                editBarType = EditBarType.GROWTH_RATE
                break
            case ToolbarBtnType.PREDICT_BASE_HIST_AVERAGE:
                editBarType = EditBarType.PREDICT_BASE_HIST_AVERAGE
                break
            case ToolbarBtnType.PREDICT_BASE_LAST_YEAR:
                editBarType = EditBarType.PREDICT_BASE_LAST_YEAR
                break
            default:
                return
            }
            nodeBtn.updateDisabled(!this._studioApiSvc.getEditBarStatus(
                nodeIds,
                editBarType,
            ))
        })
    }

    public onInsertSnippet (snippet: AddItem): void {
        switch (snippet.type) {
        case ToolbarBtnType.SUM:
            this._sumSnippetSvc.addSnippet()
            break
        case ToolbarBtnType.FORECAST:
            this._dialog.open(
                ForecastDialogComponent,
                {autoFocus: false, panelClass: 'cancel-padding-dialog'},
            )
            break
        case ToolbarBtnType.GROWTH_RATE:
            this._nodeEditSvc.calculateGrowthRate()
            break
        case ToolbarBtnType.BASE_HISTORICAL:
            this._nodeEditSvc.baseHistoricalForecast()
            break
        case ToolbarBtnType.PREDICT_BASE_LAST_YEAR:
            this._nodeEditSvc.predictBaseLastYear()
            break
        case ToolbarBtnType.PREDICT_BASE_HIST_AVERAGE:
            this._nodeEditSvc.predictBaseHistAverage()
            break
        default:
            return
        }
        return
    }
}

// tslint:disable-next-line: const-enum
export enum ButtonType {
    UNKNOWN,
    ATTENTION,
    CONFIG,
    EDIT,
    DATA,
    FILE,
    HELP,
    VIEW,
    FUNCTION,
}
