// tslint:disable: ext-variable-name naming-convention
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    NgZone,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
// tslint:disable-next-line: ter-max-len
// tslint:disable-next-line: no-import-side-effect no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Address} from '@logi/base/ts/common/excel'
import {isException} from '@logi/base/ts/common/exception'
import {KeyboardEventKeyCode} from '@logi/base/ts/common/key_code'
import {
    ActiveSheetActionBuilder,
    CustomSheetActionBuilder,
    RenderActionBuilder,
    SetExcelValueActionBuilder,
} from '@logi/src/lib/api'
import {
    Book,
    isNode,
    isSheet,
    Node,
    NodeType,
} from '@logi/src/lib/hierarchy/core'
import {
    NodeFocusInfo,
    NodeFocusService,
    SelConfigBuilder,
} from '@logi/src/web/core/editor/node-focus'
import {StudioApiService} from '@logi/src/web/global/api'
import {ReadonlyService} from '@logi/src/web/global/readonly'
import {NotificationService} from '@logi/src/web/ui/notification'
import {fromEvent, Subject, Subscription} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {CommandOp, getRegisterOp, getRegisterOpWithService} from './command'
import {ExcelService} from './excel/service'
import {Operator} from './operator'
import {OperateService} from './operator/service'

import GcSpread = GC.Spread.Sheets

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line:use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line:no-host-metadata-property
    host: {
        '[style.display]': '"flex"',
        '[style.flexDirection]': '"column"',
        '[style.flex]': '1',
        '[style.height]': '"100%"',
        '[style.overflow]': '"hidden"',
        '[style.position]': '"relative"',
    },
    selector: 'logi-excel-preview',
    styleUrls: [
        '../../../../node_modules/@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css',
        './style.scss',
    ],
    templateUrl: './template.html',
})
export class ExcelPreviewComponent implements AfterViewInit, OnDestroy {
    // tslint:disable-next-line: ng-no-get-and-set-property
    public get modelName (): string {
        const book = this._studioApiSvc.currBook()
        return book.name
    }
    public constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _excelSvc: ExcelService,
        private readonly _nodeFocusSvc: NodeFocusService,
        private readonly _notificationSvc: NotificationService,
        private readonly _operateSvc: OperateService,
        private readonly _readonlySvc: ReadonlyService,
        private readonly _studioApiSvc: StudioApiService,
        private readonly _zone: NgZone,
    ) {
    }

    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public workbook!: GcSpread.Workbook
    public cellRange = ''
    @Output() public readonly saveEvent$ = new EventEmitter()

    // tslint:disable-next-line: max-func-body-length
    public ngAfterViewInit (): void {
        /**
         * If building spread sheet inside angular zone, it will register a
         * global mousemove event listener and trigger change detection all the
         * time.
         */
        this._zone.runOutsideAngular((): void => {
            this._initWorkBook()
            this._bindFormulaBar()
        })
        this._subs.add(this._excelSvc.onRender$().subscribe((
            book: Readonly<Book> | undefined,
        ): void => {
            if (book === undefined)
                return
            this._studioApiSvc.setWorkbook(this.workbook)
            this._cd.detectChanges()
            /**
             * focus node after refreshing excel.
             */
            this.renderBook()
            this._nodeFocusSvc.setSelInfos(this._nodeFocusSvc.getSelInfos())
        }))
        this._subs.add(this._excelSvc.onRefresh$().subscribe((): void =>
            this._refresh()))
        /**
         * focus node after changing right nav;s state.
         */
        this._nodeFocusSvc.setSelInfos(this._nodeFocusSvc.getSelInfos())
        this._focusEventHandle()
        this._spreadjsEventHandle()
        this._operateSvc
            .getOperator()
            .pipe(takeUntil(this._destroyed$))
            .subscribe(operator => {
                if (!operator)
                    return
                const action = this._operateSvc
                    .getOperatorAction(this.workbook, operator)
                this._studioApiSvc.handleAction(action)
                if (operator.operator === Operator.ZOOM)
                    this._operateSvc.setZoomChanged()
            })
    }

    public ngOnDestroy (): void {
        /**
         * - Excel-preview will always exist in Logi.Studio, so no need to
         * destroy this.workbook.
         * - This.workbook has been bind to backend-service, if destroy here,
         * backend-service's workbook will be destroyed, and no way to find the
         * workbook back. So please think about:
         *    `IF REALLY WANT TO DESTROY THE WORKBOOK`.
         */
        this._destroyed$.next()
        this._destroyed$.complete()
        this._subs.unsubscribe()
    }

    /**
     * public only for test.
     */
    // tslint:disable-next-line: codelyzer-template-property-should-be-public
    public renderBook (): void {
        const action = new RenderActionBuilder().build()
        this._studioApiSvc.handleAction(action)
    }

    private _readonly = false
    @ViewChild('container') private _container!: ElementRef<HTMLElement>

    @ViewChild('formula_bar', {static: true})
    private _formulaBar!: ElementRef<HTMLElement>
    private _formula!: GcSpread.FormulaTextBox.FormulaTextBox

    private _destroyed$ = new Subject()
    private _subs = new Subscription()

    private _isCustom = false

    private _refresh (): void {
        if (this.workbook === undefined)
            return
        this.workbook.refresh()
    }

    private _focusEventHandle (): void {
        /**
         * Subscribe editor focus event.
         */
        this._nodeFocusSvc
            .listenFocusChange()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((infos: readonly NodeFocusInfo[]): void => {
                if (infos.length === 0)
                    return
                this._focusCells(infos)
            })
    }

    private _sendSourceAction (
        sheetName: string,
        positions: readonly (readonly [number, number])[],
    ): void {
        const action = new SetExcelValueActionBuilder()
            .sheetName(sheetName)
            .positions(positions)
            .build()
        this._studioApiSvc.handleAction(action)
    }

    // tslint:disable-next-line: max-func-body-length
    private _spreadjsEventHandle (): void {
        const events = GcSpread.Events
        /**
         * Active sheet change binding.
         *
         * When active sheet changed in spreadjs, tell editor to change active
         * sheet.
         */
        this._subs.add(this.workbook.bind(
            events.ActiveSheetChanged,
            (): void => {
                const gcSheet = this.workbook.getActiveSheet()
                const action = new ActiveSheetActionBuilder()
                    .activeSheet(gcSheet.name())
                    .build()
                this._studioApiSvc.handleAction(action)
            },
        ))

        this._subs.add(this.workbook.bind(GcSpread.Events.SelectionChanged, (
            // @ts-ignore
            // tslint:disable-next-line: no-unused
            type: unknown,
            args: GcSpread.ISelectionChangedEventArgs,
        ): void => {
            this._operateSvc.setSelectChanged()
            const focusNodes = getSelectionNodeIds(
                args.newSelections,
                args.sheetName,
                this._studioApiSvc,
                args.oldSelections,
            )
            const multi = args.newSelections.length === 1 ? false : true
            const config = new SelConfigBuilder()
                .multiSelect(multi)
                .isExpand(true)
                .scrollIntoView(true)
                .build()
            this._nodeFocusSvc.setSelNodes(focusNodes, undefined, config)
            /**
             * paintformat
             */
            if (!this._operateSvc.getIsFormatPaint())
                return
            const toRange = args.newSelections[0]
            this._studioApiSvc.handleAction(new CustomSheetActionBuilder()
                .payloads([this._operateSvc.formatPaintingPayload(
                    toRange,
                    this.workbook.getActiveSheet().name(),
                )])
                .build())
        }))
        this._subs.add(this.workbook.bind(GcSpread.Events.ViewZoomed, (
        ): void => {
            this._operateSvc.setZoomChanged()
        }))

        /**
         * When click cell and select focus cell by arrow key, it will trigger
         * `EnterCell` event.
         *  - We get cell range and display in formular bar when enter a cell.
         *  - We should focuse node in logi-editor.
         */
        this._subs.add(this.workbook.bind(GcSpread.Events.EnterCell, (
            // tslint:disable-next-line: ext-variable-name naming-convention
            _: unknown,
            args: GcSpread.IEnterCellEventArgs,
        ): void => {
            const sheet = args.sheet
            const cell = sheet.getCell(args.row, args.col)
            this._setFormulaBarValue(cell, false)
        }))
        /**
         * If it is in read-only mode, all editing and clipboardpasting event
         * should be prevent
         */
        this.workbook.bind(
            GcSpread.Events.EditStarting,
            // @ts-ignore
            // tslint:disable-next-line: no-unused
            (type, data: GcSpread.IEditStartingEventArgs): void => {
                data.cancel = this._readonly
            },
        )
        /**
         * If it is in read-only mode, all editing and clipboardpasting event
         * should be prevent
         */
        this.workbook.bind(
            GcSpread.Events.ClipboardPasting,
            // @ts-ignore
            // tslint:disable-next-line: no-unused
            (type, data: GcSpread.IClipboardPastingEventArgs): void => {
                data.cancel = this._readonly
            },
        )
        this._subs.add(this.workbook.bind(GcSpread.Events.ClipboardPasted, (
            // @ts-ignore
            // tslint:disable-next-line: no-unused
            type: string,
            args: GcSpread.IClipboardPastedEventArgs,
        ): void => {
            const pos: [number, number][] = []
            for (let i = 0; i < args.cellRange.colCount; i += 1)
                for (let j = 0; j < args.cellRange.rowCount; j += 1) {
                    const row = args.cellRange.row + j
                    const col = args.cellRange.col + i
                    pos.push([row, col])
                }
            this._sendSourceAction(args.sheetName, pos)
        }))
        this._subs.add(this.workbook.bind(
            GcSpread.Events.CellChanged,
            // tslint:disable-next-line: ext-variable-name naming-convention
            (_: {}, args: GcSpread.ICellChangedEventArgs): void => {
                const allowTypes = ['value', 'formula']
                if (!allowTypes.includes(args.propertyName))
                    return
                this._sendSourceAction(args.sheetName, [[args.row, args.col]])
            },
        ))

        /**
         * For listen delete key event.
         * It will trigger RangeChangedAction.clear.
         *
         * https://www.grapecity.com/forums/spreadjs/delete-value-on-cell-doesn
         * https://www.grapecity.com/forums/spreadjs/spreadjs---no-events-fire-
         */
        this._subs.add(this.workbook.bind(
            GcSpread.Events.RangeChanged,
            // tslint:disable-next-line: ext-variable-name naming-convention
            (_: {}, args: GcSpread.IRangeChangedEventArgs): void => {
                if (args.action === GcSpread.RangeChangedAction.clear)
                    this._clearRange(args.sheetName, args.changedCells)
            },
        ))
        this._subs.add(this.workbook.bind(
            GcSpread.Events.DragFillBlockCompleted,
            // tslint:disable-next-line: ext-variable-name naming-convention
            (_: {}, args: GcSpread.IDragFillBlockCompletedEventArgs): void => {
                const poss: [number, number][] = []
                const range = args.fillRange
                for (let i = 0; i < range.rowCount; i += 1)
                    for (let k = 0; k < range.colCount; k += 1)
                        // tslint:disable-next-line: limit-indent-for-method-in-class
                        poss.push([range.row + i, range.col + k])
                this._sendSourceAction(args.sheetName, poss)
            },
        ))
        this._subs.add(this.workbook.bind(
            GcSpread.Events.CellDoubleClick,
            // tslint:disable-next-line: ext-variable-name naming-convention
            (_: unknown, args: GcSpread.ICellDoubleClickEventArgs): void => {
                const cell = args.sheet.getCell(args.row, args.col)
                if (!cell.locked())
                    return
                cell.locked(false)
                args.sheet.startEdit()
                cell.locked(true)
            },
        ))
        this._subs.add(this.workbook.bind(
            GcSpread.Events.EditEnded,
            // tslint:disable-next-line: ext-variable-name naming-convention
            (_: unknown, args: GcSpread.IEditEndedEventArgs): void => {
                const res = this._studioApiSvc.sheetTabs().sheetTabs
                    .find(t => t.name === args.sheet.name() && !t.isCustom)
                if (res === undefined)
                    return
                const cell = args.sheet.getCell(args.row, args.col)
                if (!cell.locked())
                    return
                const formula = cell.formula()
                let oriText = formula !== null ? '=' + formula : cell.value()
                if (oriText !== null && typeof oriText !== 'string')
                    oriText = String(oriText)
                if (oriText !== args.editingText)
                    this._notificationSvc.showError('不可修改非事实及假设的单元格数据')
            },
        ))
        this._commandRegister()
    }

    /**
     * ctrl+R and ctrl+D need suport undo and redo
     * range select + ctrl+R / ctrl+D
     */
    // tslint:disable-next-line: max-func-body-length
    private _commandRegister (): void {
        /**
         * Record all commands to backend service.
         */
        // @ts-expect-error
        this.workbook.commandManager().addListener('record', (
            args: unknown,
        ): void => {
            /**
             * 0 means this command is not undo/redo.
             */
            // @ts-expect-error
            if (args.s4 !== 0)
                return
            const ignoreCommands = [
                'executePayloads',
                'fill',
                'clipboardPaste',
                'editCell',
            ]
            // @ts-expect-error
            const cmdName = args.command.cmd
            if (cmdName === undefined || ignoreCommands.includes(cmdName))
                return
            // @ts-expect-error
            const sheetName = args.command.sheetName
            if (typeof sheetName !== 'string')
                return
            this._sendSourceAction(sheetName, [])
        })
        /**
         * Clear the default Ctrl+Z shortcut key.
         */
        this.workbook.commandManager().setShortcutKey(
            // @ts-expect-error
            undefined,
            KeyboardEventKeyCode.KEY_Z,
            true ,
        )
        /**
         * Clear the default Ctrl+Y shortcut key.
         */
        this.workbook.commandManager().setShortcutKey(
            // @ts-expect-error
            undefined,
            KeyboardEventKeyCode.KEY_Y,
            true ,
        )
        const ops = getRegisterOp()
        ops.forEach((op: CommandOp) => {
            this.workbook.commandManager().register(
                op.name,
                op.command,
                op.key,
                op.ctrl,
                op.shift,
                op.alt,
                op.meta,
            )
        })
        const opsWithService = getRegisterOpWithService(this._studioApiSvc)
        opsWithService.forEach((op: CommandOp) => {
            this.workbook.commandManager().register(
                op.name,
                op.command,
                op.key,
                op.ctrl,
                op.shift,
                op.alt,
                op.meta,
            )
        })
    }

    /**
     * Init spreadjs workbook and attach status bar to it.
     */
    private _initWorkBook (): void {
        if (this.workbook)
            return
        const el = this._container.nativeElement
        this._subs.add(fromEvent<KeyboardEvent>(el, 'keydown').subscribe(e => {
            if (e.keyCode === KeyboardEventKeyCode.KEY_S &&
                (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
                e.preventDefault()
                this.saveEvent$.next()
            }
        }))
        this.workbook = new GcSpread.Workbook(
            el,
            {
                iterativeCalculationMaximumIterations: 100,
                sheetCount: 1,
                tabStripVisible: false,
            },
        )
        this._subs.add(this._readonlySvc.getReadonly().subscribe(r => {
            if (r === undefined)
                return
            this._readonly = r
            this.workbook.options.allowContextMenu = !r && this._isCustom
        }))
        this._subs
            .add(this._studioApiSvc.sheetTabsChange().subscribe(result => {
                this.workbook.options.allowContextMenu =
                    result.sheetTabs[result
                        .activeIndex()].isCustom && !this._readonly
                this._isCustom = result.sheetTabs[result.activeIndex()].isCustom
            }))
        setCommentContextMenu(this.workbook)
        this._studioApiSvc.setWorkbook(this.workbook)
        this._operateSvc.setComponent(this.workbook)
        this._operateSvc.setSelectChanged()
    }

    private _bindFormulaBar (): void {
        this._formula = new GcSpread.FormulaTextBox.FormulaTextBox(
            this._formulaBar.nativeElement, {
                absoluteReference: false,
                /**
             * If this option set true, it will add a button used for
             * selecting range.
             *
             * But he fomula will not display when clicking cell if this
             * option set true.
             */
                rangeSelectMode: false,
            })
        this._formula.workbook(this.workbook)
    }

    private _setFormulaBarValue (
        cell: GcSpread.CellRange,
        refresh: boolean,
    ): void {
        const range = new GcSpread.Range(
            cell.row,
            cell.col,
            cell.rowCount,
            cell.colCount,
        )
        const cellRange = GcSpread.CalcEngine
            .rangeToFormula(range)
            .split('$')
            .join('')
        this.cellRange = cellRange
        /**
         * Click the cell from sheet imported outside, it seems that no
         * change detection will be trigger and the cell range is not
         * displayed.
         *
         * So it should trigger change deteciton manually here but not
         * call markForChenck().
         */
        this._cd.detectChanges()
        /**
         * GcSheet.setActiveCell() will not trigger GcSpread.events.enterCell,
         * and GcSpread.events.enterCell will automatically refresh the formula,
         *
         * So we need to manually refresh the formula after using
         * GcSheet.setActiveCell()
         */
        if (refresh)
            this._formula.refresh()
    }

    // tslint:disable-next-line: max-func-body-length
    private _focusCells (focusInfo: readonly NodeFocusInfo[]): void {
        const oldGcSheet = this.workbook.getActiveSheet()
        const oldIds = getSelectionNodeIds(
            oldGcSheet.getSelections(),
            oldGcSheet.name(),
            this._studioApiSvc,
        )
        const newIds = focusInfo.map(r => r.nodeId)
        const difference = newIds
            .filter(x => !oldIds.includes(x))
            .concat(oldIds.filter(x => !newIds.includes(x)))

        if (difference.length === 0)
            return

        const hsf = this._studioApiSvc.getHsfManager()
        if (this.workbook === undefined || !hsf.hasBeenRendered())
            return
        const node = this._studioApiSvc.getNode(newIds[0])
        if (!isNode(node))
            return
        const parentTree = node.getAncestors()
        const sheet = parentTree.find((n: Readonly<Node>): boolean =>
            n.nodetype === NodeType.SHEET)
        if (!isSheet(sheet))
            return
        this.workbook.setActiveSheet(sheet.name)
        const gcSheet = this.workbook.getActiveSheet()
        if (sheet.uuid === newIds[0])
            return
        const allRows: Address[] = []
        newIds.forEach(info => {
            const r = hsf.getNodeAddress(sheet.name, info)
            if (isException(r)) {
                this._notificationSvc.showError(r.message)
                return
            }
            if (r === undefined)
                return
            allRows.push(r)
        })
        if (allRows.length === 0)
            return
        const activeAddr = allRows[0]
        gcSheet.clearSelection()
        gcSheet.setActiveCell(activeAddr.row, activeAddr.col)
        const cell = gcSheet.getCell(activeAddr.row, activeAddr.col)
        this._setFormulaBarValue(cell, true)
        gcSheet.showRow(activeAddr.row, GcSpread.VerticalPosition.center)
        gcSheet.showColumn(activeAddr.col, GcSpread.HorizontalPosition.center)
        allRows.forEach(r => {
            if (r.uuid !== activeAddr?.uuid)
                gcSheet.addSelection(r.row, r.col, 1, 1)
        })

        /**
         * TODO(zengkai): If remove requestionAnimationFrame here, it will input
         * into spreadjs cell when knock on keyboard after focused formula
         * bearer node container in builder.
         * Why?
         */
        requestAnimationFrame(() => {
            this.workbook.focus(false)
        })
    }

    private _clearRange (
        sheetName: string,
        cells: readonly GcSpread.ICellPosition[],
    ): void {
        const positions = cells.map((c): [number, number] => [c.row, c.col])
        this._sendSourceAction(sheetName, positions)
    }
}

function getSelectionNodeIds (
    // tslint:disable-next-line: max-params
    newSel: readonly GcSpread.Range[],
    sheetName: string,
    apiSvc: StudioApiService,
    oldSel?: readonly GcSpread.Range[],
): readonly string[] {
    const focusNodes: string[] = []
    const newSelections = oldSel !== undefined ?
        newSel.filter(r => !oldSel.includes(r)) : newSel
    newSelections.forEach(select => {
        const nodes: string[] = []
        if (select.rowCount === 1) {
            const node = apiSvc.findNodeByCoordinate(
                select.row,
                select.col,
                sheetName,
            )
            if (node !== undefined)
                nodes.push(node.uuid)
        } else
            for (let i = 0; i < select.rowCount; i += 1) {
                const row = select.row + i
                const node = apiSvc.findNodeByCoordinate(
                    row,
                    select.col,
                    sheetName,
                )
                if (node !== undefined)
                    nodes.push(node.uuid)
            }
        focusNodes.push(...nodes)
    })
    return focusNodes
}

function setCommentContextMenu (workbook: GC.Spread.Sheets.Workbook): void {
    const menuData = workbook.contextMenu.menuData
    const newMenuData: GC.Spread.Sheets.ContextMenu.IMenuItemData[] = []
    menuData.forEach((item: GcSpread.ContextMenu.IMenuItemData): void => {
        if (!item)
            return
        const newItem = item
        switch (item.name) {
        case 'gc.spread.insertComment':
            newItem.text = '添加批注'
            newMenuData.push(item)
            break
        case 'gc.spread.editComment':
            newItem.text = '编辑批注'
            newMenuData.push(item)
            break
        case 'gc.spread.deleteComment':
            newItem.text = '删除批注'
            newMenuData.push(item)
            break
        default:
            return
        }
    })
    workbook.contextMenu.menuData = newMenuData
    // tslint:disable-next-line: max-file-line-count
}
