import {debugTimer} from '@logi/base/ts/common/debug'
import {Exception, ExceptionBuilder} from '@logi/base/ts/common/exception'
import {preOrderWalk, preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {CommonNoticeBuilder, MessageType} from '@logi/src/lib/api/notice'
import {
    addChild,
    AddChildPayload,
    addLabel,
    AddLabelPayload,
    AddSheetPayload,
    addSlice,
    AddSlicePayload,
    HistoryType,
    isAddChildPayload,
    isRedoPayload,
    isRemoveChildPayload,
    isRemoveSheetPayload,
    isUndoPayload,
    MoveSheetPayload,
    Payload,
    removeAnnotation,
    RemoveAnnotationPayload,
    removeChild,
    RemoveChildPayload,
    removeLabel,
    RemoveLabelPayload,
    RemoveSheetPayload,
    removeSlice,
    removeSliceAnnotation,
    RemoveSliceAnnotationPayload,
    RemoveSlicePayload,
    RenameSheetPayload,
    setAlias,
    SetAliasPayload,
    setAnnotation,
    SetAnnotationPayload,
    SetBookPayload,
    setDataType,
    SetDataTypePayload,
    setExpression,
    SetExpressionPayload,
    setHeader,
    SetHeaderStubPayload,
    setName,
    SetNamePayload,
    setRefHeader,
    SetRefHeaderPayload,
    setSliceAnnotation,
    SetSliceAnnotationPayload,
    setSliceExpr,
    SetSliceExprPayload,
    setSliceName,
    SetSliceNamePayload,
    setSliceType,
    SetSliceTypePayload,
    setType,
    SetTypePayload,
} from '@logi/src/lib/api/payloads'
import {
    ALL_TYPES,
    Book,
    BookBuilder,
    FB_TYPES,
    getNodesVisitor,
    isBook,
    isColumn,
    isColumnBlock,
    isFormulaBearer,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    Node,
    NodeType,
    Sheet,
    Table,
    TableSubnode,
} from '@logi/src/lib/hierarchy/core'
import {Subject} from 'rxjs'

import {
    Plugin as Base,
    PluginType,
    Product,
    RemovedInfo,
    RemovedInfoBuilder,
} from '../base'
import {FormBuilder} from '../form'
import {HierarchyHandler} from '../handler'
import {updateExpr} from '../lib/handle'
import {Replacement, ReplacementBuilder} from '../lib/replacement'
import {shallowCopy, updateRoot} from '../lib/utils'

import {ValidHandler} from './handler/valid'
import {HistoryBuilder} from './history'
import {BookResult, BookResultBuilder} from './result'

export class Plugin extends Base<BookResult> implements HierarchyHandler {
    public book: Readonly<Book> = new BookBuilder().name('').build()
    public result$ = new Subject<BookResult>()
    public type = PluginType.BOOK
    public removeChildInfo = new Map<string, RemovedInfo>()

    public nodesMap: Map<string, Readonly<Node>> = new Map()
    public invalidNodes = new Set<string>()

    // tslint:disable-next-line: max-func-body-length
    @debugTimer('book plugin')
    public handle(input: Readonly<Product>): void {
        const resultBuilder = new BookResultBuilder()
            .actionType(input.actionType)
        const undo = input.payloads.find((p: Payload): boolean =>
            isUndoPayload(p) && p.undoPlugin === HistoryType.BOOK)
        if (undo !== undefined) {
            const undoBook = this._history.undo()
            if (undoBook === undefined)
                return
            this.updateBook(undoBook, false)
            resultBuilder.book(this.book)
            this.result$.next(resultBuilder.build())
            return
        }
        const redo = input.payloads.find((p: Payload): boolean =>
            isRedoPayload(p) && p.redoPlugin === HistoryType.BOOK)
        if (redo !== undefined) {
            const redoBook = this._history.redo()
            if (redoBook === undefined)
                return
            this.updateBook(redoBook, false)
            resultBuilder.book(this.book)
            this.result$.next(resultBuilder.build())
            return
        }

        this.removeChildInfo = removePayloadInfo(
            input.payloads,
            this.nodesMap,
            this.book,
        )
        this._handlePayloads(input)
        if (this._exceptions.length > 0) {
            const notice = new CommonNoticeBuilder()
                .actionType(input.actionType)
                .message(this._exceptions[0].message)
                .type(MessageType.ERROR)
                .build()
            this.notice.next(notice)
            return
        }
        if (!this._changed)
            return
        input.addChanged(this.type)
        resultBuilder.book(this.book)
        this.result$.next(resultBuilder.build())
    }

    public updateBook(book: Readonly<Book>, isHistory = true): void {
        this.book = book

        if (isHistory)
            this._history.add(book)

        const nodes = preOrderWalk(this.book, getNodesVisitor, ALL_TYPES)
        this.nodesMap.clear()
        nodes.forEach((n: Readonly<Node>): void => {
            this.nodesMap.set(n.uuid, n)
        })
    }

    public addSheetPayload(p: AddSheetPayload): void {
        const book = this._getBookSubStitute()
        addChild(book, p.sheet, p.hierarchyPos)
    }

    public removeSheetPayload(p: RemoveSheetPayload): void {
        const book = this._getBookSubStitute()
        const sheet = this.book.sheets.find(s => s.name === p.name)
        if (sheet === undefined)
            return
        removeChild(book, sheet.uuid)
    }

    public moveSheetPayload(p: MoveSheetPayload): void {
        const oriIndex = this.book.sheets.findIndex(s => s.name === p.name)
        if (oriIndex < 0)
            return
        if (p.hierarchyPos === undefined)
            return
        const book = this._getBookSubStitute()
        if (!isBook(book))
            return
        const sheet = book.sheets[oriIndex]
        // @ts-ignore
        // tslint:disable-next-line: no-type-assertion
        const sheets = book.subnodes as Readonly<Sheet>[]
        sheets.splice(oriIndex, 1)
        sheets.splice(p.hierarchyPos, 0, sheet)
    }

    public renameSheetPayload(p: RenameSheetPayload): void {
        const sheet = this.book.sheets.find(s => s.name === p.oldName)
        if (sheet === undefined)
            return
        const node = this._getSubStitute(sheet.uuid)
        if (node === undefined)
            return
        setName(node, p.name)
    }

    public setBookPayload(p: SetBookPayload): void {
        this.updateBook(p.book)
        this._changed = true
    }

    public addChildPayload(p: AddChildPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        addChild(node, p.child, p.position)
    }

    public addLabelPayload(p: AddLabelPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        addLabel(node, p.label, p.position)
    }

    public addSlicePayload(p: AddSlicePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            addSlice(node, p.slice, p.position)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public removeChildPayload(p: RemoveChildPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        removeChild(node, p.child)
    }

    public removeLabelPayload(p: RemoveLabelPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        removeLabel(node, p.label)
    }

    public removeSlicePayload(p: RemoveSlicePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            removeSlice(node, p.index)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setNamePayload(p: SetNamePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        setName(node, p.name)
    }

    public setHeaderStubPayload(p: SetHeaderStubPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isTable(node))
            setHeader(node, p.stub)
        else
            this._exceptions.push(nodeTypeException([NodeType.TABLE]))
    }

    public setDataTypePayload(p: SetDataTypePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isRow(node))
            setDataType(node, p.dataType)
        else
            this._exceptions.push(nodeTypeException([NodeType.ROW]))
    }

    public setExpressionPayload(p: SetExpressionPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setExpression(node, p.expression)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setSliceExprPayload(p: SetSliceExprPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setSliceExpr(node, p.index, p.expression)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setRefHeaderPayload(p: SetRefHeaderPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isTable(node))
            setRefHeader(node, p.referenceHeader)
        else
            this._exceptions.push(nodeTypeException([NodeType.TABLE]))
    }

    public setSliceNamePayload(p: SetSliceNamePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setSliceName(node, p.index, p.name)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setTypePayload(p: SetTypePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setType(node, p.type)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setSliceTypePayload(p: SetSliceTypePayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setSliceType(node, p.index, p.type)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setSliceAnnotationPayload(p: SetSliceAnnotationPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setSliceAnnotation(node, p.index, p.key, p.value)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setAliasPayload(p: SetAliasPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            setAlias(node, p.alias)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public removeSliceAnnotationPayload(p: RemoveSliceAnnotationPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        if (isFormulaBearer(node))
            removeSliceAnnotation(node, p.index, p.key)
        else
            this._exceptions.push(
                nodeTypeException([NodeType.ROW, NodeType.COLUMN]),
            )
    }

    public setAnnotationPayload(p: SetAnnotationPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        setAnnotation(node, p.key, p.value)
    }

    public removeAnnotationPayload(p: RemoveAnnotationPayload): void {
        const node = this._getSubStitute(p.uuid)
        if (node === undefined)
            return
        removeAnnotation(node, p.key)
    }

    private _history = new HistoryBuilder().build()

    private _validHandler = new ValidHandler()

    // tslint:disable-next-line: readonly-array
    private _exceptions: Exception[] = []
    /**
     * This set marks the uuid of nodes in `nodesMap` which already have
     * substiute.
     */
    private _hasSubstitute = new Set<string>()

    // tslint:disable-next-line: readonly-array
    private _repls: Replacement[] = []

    private _changed = false

    private _handlePayloads(input: Readonly<Product>): void {
        this._exceptions = []
        /**
         * This set marks the uuid of nodes in `nodesMap` which already have
         * substiute.
         */
        this._hasSubstitute = new Set<string>()
        this._repls = []
        this._changed = false
        /**
         * AddChild payload passes the new Hierarchy node, they should be stored
         * in `nodesMap`.
         */
        input.payloads.forEach((p: Payload): void => {
            if (!isAddChildPayload(p))
                return
            const nodes = preOrderWalk2(p.child, getNodesVisitor, ALL_TYPES)
            nodes.forEach((n: Readonly<Node>): void => {
                if (this.nodesMap.get(n.uuid) !== undefined)
                    return
                this.nodesMap.set(n.uuid, n)
                this._hasSubstitute.add(n.uuid)
            })
        })
        this.handlePayloads(input)
        if (this._repls.length === 0)
            return
        const root = updateRoot(this._repls)
        if (!isBook(root)) {
            this._exceptions.push(new ExceptionBuilder()
                .message('The root is not a book')
                .build())
            return
        }
        let book = updateExpr(root, input.payloads)
        book = this._validHandler.updateValid(book, input.payloads)
        this.invalidNodes = this._validHandler.invalidNodes
        this.updateBook(book)
        this._changed = true
    }

    private _getSubStitute(uuid: string): Readonly<Node> | undefined {
        let substitute = this.nodesMap.get(uuid)
        if (substitute === undefined) {
            this._exceptions.push(new ExceptionBuilder()
                .message(`Can not find hierarchy node by uuid ${uuid}`)
                .build())
            return
        }
        if (this._hasSubstitute.has(uuid))
            return substitute
        const original = substitute
        this._hasSubstitute.add(uuid)
        substitute = shallowCopy(original)
        this.nodesMap.set(uuid, substitute)
        const r = new ReplacementBuilder()
            .original(original)
            .substitute(substitute)
            .build()
        this._repls.push(r)
        return substitute
    }

    private _getBookSubStitute(): Readonly<Node> {
        let substitute = this.nodesMap.get(this.book.uuid) ?? this.book
        if (this._hasSubstitute.has(substitute.uuid))
            return substitute
        const original = substitute
        this._hasSubstitute.add(original.uuid)
        substitute = shallowCopy(original)
        this.nodesMap.set(original.uuid, substitute)
        const r = new ReplacementBuilder()
            .original(original)
            .substitute(substitute)
            .build()
        this._repls.push(r)
        return substitute
    }
}

// tslint:disable-next-line: max-func-body-length
function removePayloadInfo(
    payloads: readonly Payload[],
    map: Map<string, Readonly<Node>>,
    book: Readonly<Book>,
): Map<string, RemovedInfo> {
    const infoMap = new Map<string, RemovedInfo>()
    const removeSheets = payloads.filter(isRemoveSheetPayload)
    removeSheets.forEach((p: RemoveSheetPayload): void => {
        const sheetIdx = book.sheets.findIndex(s => s.name === p.name)
        if (sheetIdx < 0)
            return
        const sheet = book.sheets[sheetIdx]
        const uuids = preOrderWalk(sheet, getNodesVisitor, FB_TYPES)
            .map((n: Readonly<Node>): string => n.uuid)
        const info = new RemovedInfoBuilder()
            .fbs(uuids)
            .sheetName(sheet.name)
            .type(sheet.nodetype)
            .responsible(sheet.name)
            .index(sheetIdx)
            .build()
        infoMap.set(sheet.name, info)
    })

    const removePs = payloads.filter(isRemoveChildPayload)
    removePs.forEach((p: RemoveChildPayload): void => {
        const child = map.get(p.child)
        if (child === undefined)
            return
        const fbs: string[] = []
        if (!(isFormulaBearer(child) ||
            isRowBlock(child) || isColumnBlock(child))) {
            const uuids = preOrderWalk(child, getNodesVisitor, FB_TYPES)
                .map((n: Readonly<Node>): string => n.uuid)
            fbs.push(...uuids)
        } else {
            const target = isColumn(child) || isColumnBlock(child)
                ? [NodeType.COLUMN]
                : [NodeType.ROW]
            const uuids = preOrderWalk(child, getNodesVisitor, target)
                .map((n: Readonly<Node>): string => n.uuid)
            fbs.push(...uuids)
            const table = child.getTable()
            if (isTable(table)) {
                const opposite = isColumn(child) || isColumnBlock(child)
                    ? table.getLeafRows()
                    : table.getLeafCols()
                fbs.push(...opposite.map(n => n.uuid))
            }
        }
        const sheet = child.findParent(NodeType.SHEET)
        if (!isSheet(sheet))
            return
        const res = isTableSubnode(child) ? child.getTable() : sheet
        if (res === undefined)
            return
        const info = new RemovedInfoBuilder()
            .fbs(fbs)
            .sheetName(sheet.name)
            .type(child.nodetype)
            .responsible(isSheet(child) ? child.name : res.uuid)
            .index(getRemovedIndex(child))
            .build()
        infoMap.set(p.child, info)
    })
    return infoMap
}

function isTableSubnode(node: unknown): node is Readonly<TableSubnode> {
    return isRow(node) || isColumn(node) ||
        isRowBlock(node) || isColumnBlock(node)
}

function getRemovedIndex(child: Readonly<Node>): number {
    if (isTable(child)) {
        const sheet = child.findParent(NodeType.SHEET)
        if (!isSheet(sheet))
            return -1
        return sheet.tree.filter(isTable).findIndex((
            v: Readonly<Table>,
        ): boolean => v === child)
    }
    if (isSheet(child)) {
        const book = child.parent
        if (!isBook(book))
            return -1
        book.sheets.findIndex((s: Readonly<Sheet>) => s === child)
    }
    if (isRow(child) || isRowBlock(child)) {
        const table = child.getTable()
        if (!isTable(table))
            return -1
        const rows = preOrderWalk(
            table,
            getNodesVisitor,
            [NodeType.ROW, NodeType.ROW_BLOCK],
        )
        return rows.indexOf(child)
    }
    return -1
}

function nodeTypeException(expected: readonly NodeType[]): Exception {
    return new ExceptionBuilder()
        .message(`Expected NodeType: ${expected}`)
        .build()
}

export const BOOK_FORM = new FormBuilder()
    .type(PluginType.BOOK)
    .deps([])
    .ctor(Plugin)
    .build()
// tslint:disable-next-line: max-file-line-count
