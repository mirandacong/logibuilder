// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'

// tslint:disable-next-line: ordered-imports
import {assertIsDefined} from '@logi/base/ts/common/assert'
import {Builder} from '@logi/base/ts/common/builder'
import {Notice} from '@logi/src/lib/api/notice'
import {
    Clipboard,
    ClipboardPlugin,
    PluginType,
    SheetTabsPlugin,
    SheetTabsResult,
} from '@logi/src/lib/api/plugins'
import {FormulaManager} from '@logi/src/lib/formula'
import {Book} from '@logi/src/lib/hierarchy/core'
import {
    Controller,
    DisplayResponse,
    Event as EditorEvent,
} from '@logi/src/lib/intellisense'
import {ModifierManager} from '@logi/src/lib/modifier'
import {SourceManager} from '@logi/src/lib/source'
import {TemplateSet} from '@logi/src/lib/template'
import {injectable} from 'inversify'
import {Observable, Subject} from 'rxjs'

import {convertToExcel} from '@logi/src/lib/hsf'
import {ModelBuilder} from '@logi/src/lib/model'
import {RenderService, RenderServiceImpl} from './render'

export const CONSTRAINT_SHEET_NAME = '__constraints__'
export const CACL_SHEET_NAME = '__calc__'

export interface EditorService extends RenderService {
    readonly clipboard: Readonly<Clipboard>
    getUndoPlugins(): readonly PluginType[]
    getRedoPlugins(): readonly PluginType[]
    canUndo(): boolean
    canRedo(): boolean
    setWorkbook(excel: GC.Spread.Sheets.Workbook): void
    getActiveSheet(): string
    connect(
        event$: Observable<EditorEvent>,
    ): Observable<Observable<DisplayResponse>>
    sheetTabs(): Readonly<SheetTabsResult>
}

@injectable()
export class EditorServiceImpl extends RenderServiceImpl
    implements EditorService {
    public get clipboard(): Readonly<Clipboard> {
        return this.clipboardPlugin.clipboard
    }

    // tslint:disable-next-line: max-func-body-length
    public constructor(public readonly pluginTypes: readonly PluginType[] = [
        PluginType.BOOK,
        PluginType.STD_HEADER,
        PluginType.SOURCE,
        PluginType.FORMULA,
        PluginType.MODIFIER,
        PluginType.CLIPBOARD,
        PluginType.EXPR,
        PluginType.HSF,
        PluginType.WORKBOOK,
        PluginType.DOWNLOAD,
        PluginType.FOCUS,
        PluginType.SHEET_TABS,
        PluginType.ERROR,
    ]) {
        super(pluginTypes)
        this._initEditorPlugins()
    }
    public sheetTabsPlugin!: SheetTabsPlugin

    public clipboardPlugin!: ClipboardPlugin
    /**
     * Used for simpe-editor.
     */
    public controller = new Controller([])

    public noticeEmitter$!: Subject<Notice>
    public getActiveSheet(): string {
        return this.sheetTabsPlugin.sheetTabs.activeSheet
    }

    public sheetTabs(): Readonly<SheetTabsResult> {
        return this.sheetTabsPlugin.sheetTabs
    }

    public connect(
        event$: Observable<EditorEvent>,
    ): Observable<Observable<DisplayResponse>> {
        return this.controller.connect(event$)
    }

    public setWorkbook(excel: GC.Spread.Sheets.Workbook): void {
        this.workbookPlugin.workbook = excel
    }

    public recordUndo(types: readonly PluginType[]): void {
        const supportHistory = [
            PluginType.BOOK,
            PluginType.STD_HEADER,
            PluginType.SOURCE,
            PluginType.FOCUS,
            PluginType.MODIFIER,
            PluginType.HSF,
            PluginType.WORKBOOK,
        ]
        if (types.find((t: PluginType): boolean =>
            supportHistory.includes(t)) === undefined)
            return
        this.undoStack.push(types)
        this.redoStack = []
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0
    }

    public getUndoPlugins(): readonly PluginType[] {
        const result = this.undoStack.pop()
        if (result === undefined)
            return []
        this.redoStack.push(result)
        return result
    }

    public getRedoPlugins(): readonly PluginType[] {
        const result = this.redoStack.pop()
        if (result === undefined)
            return []
        this.undoStack.push(result)
        return result
    }

    private _initEditorPlugins(): void {
        const clipboard = this.plugins.find(p => p instanceof ClipboardPlugin)
        assertIsDefined<ClipboardPlugin>(clipboard)
        this.clipboardPlugin = clipboard
        const sheetTabs = this.plugins.find(p => p instanceof SheetTabsPlugin)
        assertIsDefined<SheetTabsPlugin>(sheetTabs)
        this.sheetTabsPlugin = sheetTabs
    }
}

export class EditorServiceBuilder extends
    Builder<EditorService, EditorServiceImpl> {
    public constructor(obj?: Readonly<EditorService>) {
        const impl = new EditorServiceImpl()
        if (obj)
            EditorServiceBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public book(book: Readonly<Book>): this {
        const impl = this.getImpl()
        this.getImpl().bookPlugin.updateBook(book)
        this.getImpl().exprManager.convert(book)
        const model = new ModelBuilder()
            .book(impl.book)
            .sourceManager(impl.sourceManager)
            .build()
        const hsf = impl.hsfManager
            .render(model, impl.exprManager, impl.bookMap)
        convertToExcel(hsf, impl.excel)
        return this
    }

    public templateSet(templateSet: Readonly<TemplateSet>): this {
        this.getImpl().stdHeaderPlugin.updateTemplateSet(templateSet)
        return this
    }

    public sourceManager(sm: SourceManager): this {
        this.getImpl().sourcePlugin.sourceManager = sm
        return this
    }

    public formulaManager(m: FormulaManager): this {
        this.getImpl().formulaPlugin.formulaManager = m
        return this
    }

    public modifierManager(m: ModifierManager): this {
        this.getImpl().modifierPlugin.modifierManager = m
        return this
    }
}
