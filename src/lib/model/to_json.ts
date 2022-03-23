import {TemplateSet} from '@logi/src/lib/template'
import {
    Book,
    Node,
    Sheet,
    isTable,
    Title,
    Table,
    Row,
    Column,
    RowBlock,
    ColumnBlock,
    isRow,
    isColumn,
    SliceExpr,
    FormulaBearer,
    isRowBlock,
    isColumnBlock,
} from '@logi/src/lib/hierarchy/core'

import {Model} from './base'

type JsonObj = Record<string, unknown>

export function toJson(model: Model): JsonObj {
    const modelJson: JsonObj = {}
    const book = model.book
    modelJson['book'] = bookToJson(book)
    model.formulaManager.gc(book)
    modelJson['formulaManager'] = model.formulaManager.data
    model.sourceManager.gc(book)
    modelJson['sourceManager'] = model.sourceManager.data
    model.modifierManager.gc(book)
    modelJson['modifierManager'] = model.modifierManager.getModifers()
    modelJson['templateSet'] = templateToJson(model.stdHeaderSet)
    return modelJson
}

function bookToJson(book: Readonly<Book>): JsonObj {
    const bookJson: JsonObj = {}
    setCommonAttrs(book, bookJson)
    bookJson.subnodes = book.sheets.map(sheetToJson)
    return bookJson
}

function sheetToJson(sheet: Readonly<Sheet>): JsonObj {
    const sheetJson: JsonObj = {}
    setCommonAttrs(sheet, sheetJson)
    sheetJson.subnodes = sheet.tree.map(t =>
        isTable(t) ? tableToJson(t) : titleToJson(t))
    return sheetJson
}

function titleToJson(book: Readonly<Title>): JsonObj {
    const titleJson: JsonObj = {}
    setCommonAttrs(book, titleJson)
    titleJson.subnodes = book.tree.map(t =>
        isTable(t) ? tableToJson(t) : titleToJson(t))
    return titleJson
}

function tableToJson(table: Readonly<Table>): JsonObj {
    const tableJson: JsonObj = {}
    setCommonAttrs(table, tableJson)
    tableJson.headerStub = table.headerStub
    tableJson.referenceHeader = table.referenceHeader
    const subnodes = table.asUnsafe().subnodes
        .map((node => {
            if(isRow(node))
                return rowToJson(node)
            if (isRowBlock(node))
                return rowBlockToJson(node)
            if (isColumn(node))
                return colToJson(node)
            if (isColumnBlock(node))
                return colBlockToJson(node)
            return
        }))
        .filter(value => value !== undefined)
    tableJson.subnodes = subnodes
    return tableJson
}

function rowToJson(row: Readonly<Row>): JsonObj {
    const rowJson: JsonObj = {}
    setCommonAttrs(row, rowJson)
    setFormulaAttrs(row, rowJson)
    rowJson.isDefScalar = row.isDefScalar
    return rowJson
}

function rowBlockToJson(rowBlock: Readonly<RowBlock>): JsonObj {
    const rowBlockJson: JsonObj = {}
    setCommonAttrs(rowBlock, rowBlockJson)
    rowBlockJson.subnodes = rowBlock.tree.map(r =>
        isRow(r) ? rowToJson(r) : rowBlockToJson(r))
    return rowBlockJson
}

function colToJson(col: Readonly<Column>): JsonObj {
    const colJson: JsonObj = {}
    setCommonAttrs(col, colJson)
    setFormulaAttrs(col, colJson)
    return colJson
}

function colBlockToJson(colBlock: Readonly<ColumnBlock>): JsonObj {
    const rowBlockJson: JsonObj = {}
    setCommonAttrs(colBlock, rowBlockJson)
    rowBlockJson.subnodes = colBlock.tree.map(c =>
        isColumn(c) ? colToJson(c) : colBlockToJson(c))
    return rowBlockJson
}

function sliceToJson(slice: SliceExpr): JsonObj {
    const sliceJson: JsonObj = {}
    sliceJson.uuid = slice.uuid
    sliceJson.name = slice.name
    sliceJson.expression = slice.expression
    sliceJson.type = slice.type
    const annotations: JsonObj = {}
    slice.annotations.forEach((value: string, key: string): void => {
        annotations[key] = value
    })
    sliceJson.annotations = annotations
    return sliceJson
}

function setCommonAttrs(node: Readonly<Node>, jsonObj: JsonObj): void {
    jsonObj.uuid = node.uuid
    jsonObj.name = node.name
    jsonObj.nodetype = node.nodetype
    jsonObj.labels = node.labels
    const annotations: JsonObj = {}
    node.annotations.forEach((value: string, key: string): void => {
        annotations[key] = value
    })
    jsonObj.annotations = annotations
}

function setFormulaAttrs(fb: Readonly<FormulaBearer>, jsonObj: JsonObj): void {
    jsonObj.expression = fb.expression
    jsonObj.type = fb.type
    jsonObj.alias = fb.alias
    jsonObj.separator = fb.separator
    jsonObj.valid = fb.valid
    jsonObj.sliceExprs = fb.sliceExprs.map(sliceToJson)
}

function templateToJson(set: Readonly<TemplateSet>): JsonObj {
    const setJson: JsonObj = {}
    setJson.defaultHeader = set.defaultHeader
    setJson.standardHeaders = set.standardHeaders
    return setJson
}
