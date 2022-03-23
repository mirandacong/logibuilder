import {Error, lex, Token} from '@logi/src/lib/dsl/lexer/v2'
import {
    DisplayResponse,
    EditorDisplayUnit,
    UnitType,
} from '@logi/src/lib/intellisense/editor/display'
import {
    EditorCompositonEvent,
    EditorFocusEvent,
    EditorInputEvent,
    EditorKeyboardEvent,
    EditorMouseEvent,
    Event,
    isClickPanelEvent,
    isEditorCompositonEvent,
    isEditorFocusEvent,
    isEditorInitialEvent,
    isEditorInputEvent,
    isEditorKeyboardEvent,
    isEditorMouseEvent,
} from '@logi/src/lib/intellisense/editor/events'
import {
    ControllerActionType,
    FocusEventHandler,
    HandleResult,
    initDisplay,
    InputEventHandler,
    KeyboardEventHandler,
    MouseEventHandler,
} from '@logi/src/lib/intellisense/editor/handlers'
import {
    Adviser,
    AdviserBuilder,
    Filter,
    FilterBuilder,
    Hint,
    HintBuilder,
} from '@logi/src/lib/intellisense/suggest'
import {findEditingBlock} from '@logi/src/lib/intellisense/utils'
import {Observable, Subscriber, TeardownLogic} from 'rxjs'

import {History} from './history'
import {getActionResponses} from './response/controller_action'
import {getEditorResponse} from './response/editor'
import {getFuncHelperResponse} from './response/func_helper'
import {getPanelResponse} from './response/panel'
import {
    INVALID_LOCATION,
    INVALID_TEXTSTATUS,
    Status,
    StatusBuilder,
} from './status/entry'

export class Controller extends History {
    public constructor(data: readonly string[]) {
        super()
        this._adviser = new AdviserBuilder().dict(data).build()
    }

    public connect(
        event$: Observable<Event>,
    ): Observable<Observable<DisplayResponse>> {
        let subscriber = new Subscriber()
        const result$ = Observable
            .create((s: Subscriber<Observable<DisplayResponse>>):
            Subscriber<Observable<DisplayResponse>> => subscriber = s)
        // tslint:disable-next-line: max-func-body-length
        event$.subscribe((e: Event): void => subscriber.next(Observable.create((
            s: Subscriber<DisplayResponse>,
        ): TeardownLogic => {
            const hr = this._handleEvent(e)
            if (hr === undefined) {
                s.complete()
                return
            }
            const actionType = hr.action.type
            if (actionType !== ControllerActionType.NONE
                && actionType !== ControllerActionType.CONTROLLER_REDO
                && actionType !== ControllerActionType.CONTROLLER_UNDO) {
                const result = getActionResponses(hr.newStatus, hr.action)
                result.forEach((v: DisplayResponse): void => {
                    s.next(v)
                })
                if (actionType !== ControllerActionType.CUT) {
                    s.complete()
                    return
                }
            }

            const txtStatus = hr.newStatus.textStatus
            const txtResponse = getEditorResponse(
                txtStatus,
                this._status.location.node,
            )
            s.next(txtResponse)

            const suggestResponse = getPanelResponse(
                hr.newStatus.panelStatus,
                hr.intellisense || hr.showPanel,
            )
            s.next(suggestResponse)

            if (hr.showFuncUsage) {
                const funcUsageResponse = getFuncHelperResponse(txtStatus)
                if (funcUsageResponse !== undefined)
                    s.next(funcUsageResponse)
            }

            s.complete()
        })))
        return result$
    }

    private _status: Status = new StatusBuilder()
        .textStatus(INVALID_TEXTSTATUS)
        .location(INVALID_LOCATION)
        .build()

    private _adviser: Adviser
    private _keyboardHandler = new KeyboardEventHandler()
    private _mouseHandler = new MouseEventHandler()
    private _focusHandler = new FocusEventHandler()
    private _inputHandler = new InputEventHandler()
    private _clickPanel = false

    private _handleEvent(event: Event): HandleResult | undefined {
        let result: HandleResult | undefined
        if (isEditorKeyboardEvent(event)
            || isEditorCompositonEvent(event))
            result = this._handleKeyboardEvent(event)
        else if (isEditorInputEvent(event))
            result = this._handleInputEvent(event)
        if (isEditorMouseEvent(event)) {
            if (isClickPanelEvent(event))
                this._clickPanel = true
            result = this._handleMouseEvent(event)
        }
        if (isEditorFocusEvent(event)) {
            if (this._clickPanel) {
                this._clickPanel = false
                return
            }
            result = this._handleFocusEvent(event)
        }
        if (isEditorInitialEvent(event))
            result = initDisplay(event)
        if (result === undefined)
            return
        if (result.action.type === ControllerActionType.CONTROLLER_REDO)
            result = this.textRedo(result)
        else if (result.action.type === ControllerActionType.CONTROLLER_UNDO)
            result = this.textUndo(result)
        if (result === undefined)
            return
        if (result.intellisense) {
            const hint = buildHint(result.newStatus)
            const suggest = this._adviser.getSuggestion(hint)
            result.newStatus.panelStatus.addData(suggest.candidateGroups)
        }
        if (result.txtPush)
            this.addStatusBuffer(result.newStatus)
        this._status = result.newStatus
        return result
    }

    private _handleKeyboardEvent(
        event: EditorKeyboardEvent | EditorCompositonEvent,
    ): HandleResult | undefined {
        return this._keyboardHandler.updateStatus(this._status, event)
    }

    private _handleMouseEvent(
        event: EditorMouseEvent,
    ): HandleResult | undefined {
        const result = this._mouseHandler.updateStatus(this._status, event)
        if (result !== undefined)
            this.resetStacks(result.newStatus)
        return result
    }

    private _handleFocusEvent(event: EditorFocusEvent): HandleResult {
        const result = this._focusHandler.updateStatus(this._status, event)
        this.resetStacks()
        return result
    }

    private _handleInputEvent(
        event: EditorInputEvent,
    ): HandleResult | undefined {
        return this._inputHandler.updateStatus(this._status, event)
    }
}

/**
 * Transform the status to a easily understandable way to adviser.
 */
function buildHint(status: Status): Readonly<Hint> {
    const textStatus = status.textStatus
    const placeHolder = ''
    const filterMap = new Map<number, Filter>()
    const textArray: string[] = []
    let offset = textStatus.endOffset
    textStatus.text.forEach((ele: string | EditorDisplayUnit, idx: number):
    void => {
        if (typeof ele !== 'string' && ele.tags.includes(UnitType.FILTER)) {
            filterMap.set(idx, new FilterBuilder().value(ele.content).build())
            textArray.push(placeHolder)
            offset = idx <= textStatus.endOffset ? offset - 1 : offset
        } else if (typeof ele === 'string')
            textArray.push(ele)
    })
    const currText = textArray.join('')
    const currTokens = lex(currText)
    const editing = findEditingBlock(offset, currTokens)
    const filters: Filter[] = []
    filterMap.forEach((value: Filter, key: number): void => {
        if (key >= editing.start && key <= editing.end)
            filters.push(value)
    })
    const editingText = currTokens
        .slice(editing.start, editing.end + 1)
        .map((c: Readonly<Token | Error>): string => c.image)
        .join('')
    const prefix = currTokens
        .slice(0, editing.start)
        .map((c: Readonly<Token | Error>): string => c.image)
        .join('')
    const suffix = currText.slice(prefix.length + editingText.length)
    return new HintBuilder()
        .filters(filters)
        .text(editingText)
        .prefix(prefix)
        .suffix(suffix)
        .location(status.location)
        .build()
}
