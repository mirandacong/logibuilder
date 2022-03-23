/* eslint-disable max-lines */
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'
import {
    FormulaManager,
    FormulaItemBuilder,
    FormulaItem,
} from '@logi/src/lib/formula'
import {
    SourceManager,
    Item as SourceItem,
    ItemBuilder as SourceItemBuillder,
    ManualSourceBuilder,
} from '@logi/src/lib/source'
import {
    ModifierManager,
    ModifierBuilder,
    Modifier,
    FontBuilder,
    FormatBuilder,
} from '@logi/src/lib/modifier'
import {Model, ModelBuilder} from './base'
import {
    TemplateSet,
    TemplateSetBuilder,
    StandardHeader,
    StandardHeaderBuilder,
    HeaderInfo,
    HeaderInfoBuilder,
    ReportDateBuilder,
} from '@logi/src/lib/template'
import {
    Book,
    NodeBuilder,
    Node,
    BookBuilder,
    isAnnotationKey,
    AnnotationKey,
    Sheet,
    SheetBuilder,
    Title,
    TitleBuilder,
    Table,
    TableBuilder,
    NodeType,
    FormulaBearer,
    FormularBearerBuilder,
    Row,
    RowBuilder,
    RowBlock,
    RowBlockBuilder,
    Column,
    ColumnBuilder,
    ColumnBlock,
    ColumnBlockBuilder,
    SliceExpr,
    SliceExprBuilder,
} from '@logi/src/lib/hierarchy/core'

type JsonObj = Record<string,unknown>

export function fromJson(modelJson: JsonObj): Readonly<Model> | Exception {
    // tslint:disable: no-type-assertion
    const book = buildBook(modelJson['book'])
    if (isException(book))
        return book
    const formulaManager = buildFormulaManager(modelJson['formulaManager'])
    const sourceManager = buildSourceManager(modelJson['sourceManager'])
    const modifierManager = buildModifierManager(modelJson['modifierManager'])
    const stdHeaderSet = buildTemplateSet(modelJson['templateSet'])
    return new ModelBuilder()
        .book(book)
        .sourceManager(sourceManager)
        .formulaManager(formulaManager)
        .modifierManager(modifierManager)
        .stdHeaderSet(stdHeaderSet)
        .build()
}

function buildSourceManager(smJson: unknown): SourceManager {
    if (!(smJson instanceof Array))
        return new SourceManager([])
    const items: SourceItem[] = []
    smJson.forEach(item => {
        const row = item.row
        const col = item.col
        const sourceObj = item.source
        if (typeof sourceObj !== 'object')
            return
        const value = sourceObj.value
        if (typeof row !== 'string' || typeof col !== 'string' ||
            (typeof value !== 'string' && typeof value !== 'number'))
            return
        const source = new ManualSourceBuilder().value(value).build()
        items.push(new SourceItemBuillder()
            .row(row)
            .col(col)
            .source(source)
            .build())
    })
    return new SourceManager(items)
}

function buildFormulaManager(fmJson: unknown): FormulaManager {
    if (!(fmJson instanceof Array))
        return new FormulaManager([])
    const items: FormulaItem[] = []
    fmJson.forEach(item => {
        const row = item.row
        const col = item.col
        const formula = item.formula
        if (typeof row !== 'string' || typeof col !== 'string' ||
            typeof formula !== 'string')
            return
        items.push(new FormulaItemBuilder()
            .row(row)
            .col(col)
            .formula(formula)
            .build())
    })
    return new FormulaManager(items)
}

function buildModifierManager(fmJson: unknown): ModifierManager {
    if (!(fmJson instanceof Array))
        return new ModifierManager([])
    const modifiers: Modifier[] = []
    fmJson.forEach(item => {
        const uuid = item.uuid
        const formatJson = item.format
        const fontJson = item.font
        if (typeof uuid !== 'string' || typeof formatJson !== 'object' ||
            typeof fontJson !== 'object')
            return
        const format = new FormatBuilder()
            .currency(formatJson.currency)
            .decimalPlaces(formatJson.decimalPlaces)
            .percent(formatJson.percent)
            .thousandsSeparator(formatJson.thousandsSeparator)
            .build()
        const font = new FontBuilder()
            .bold(fontJson.bold)
            .family(fontJson.family)
            .indent(fontJson.indent)
            .italic(fontJson.italic)
            .line(fontJson.line)
            .size(fontJson.size)
            .build()
        modifiers.push(new ModifierBuilder()
            .uuid(uuid)
            .format(format)
            .font(font)
            .build())
    })
    return new ModifierManager(modifiers)
}

function buildTemplateSet(setJson: unknown): TemplateSet {
    if (typeof setJson !== 'object' || setJson === null)
        return new TemplateSetBuilder().build()
    const json = setJson as JsonObj
    const standardHeaders = json.standardHeaders
    const defaultHeader = json.defaultHeader
    const builder = new TemplateSetBuilder()
    if (typeof defaultHeader === 'string')
        builder.defaultHeader(defaultHeader)
    if (!(standardHeaders instanceof Array))
        return builder.build()
    const stds: StandardHeader[] = []
    // tslint:disable-next-line: max-func-body-length
    standardHeaders.forEach(std => {
        const name = std.name
        const unit = std.unit
        if (typeof name !== 'string' || typeof unit !== 'number')
            return
        const rdJson = std.reportDate
        if (typeof rdJson !== 'object')
            return
        const year = rdJson.year
        const month = rdJson.month
        const day = rdJson.day
        if (typeof year !== 'number' || typeof month !== 'number' ||
            typeof day !== 'number')
            return
        const reportDate = new ReportDateBuilder()
            .year(year)
            .month(month)
            .day(day)
            .build()
        const hisJson = std.headerInfos
        if (!(hisJson instanceof Array))
            return
        const headerInfos: HeaderInfo[] = []
        hisJson.forEach(hi => {
            const frequency = hi.frequency
            const startYear = hi.startYear
            const endYear = hi.endYear
            const startMonth = hi.startMonth
            const endMonth = hi.endMonth
            const hiBuilder = new HeaderInfoBuilder()
            if (typeof frequency ==='number')
                hiBuilder.frequency(frequency)
            if (typeof startYear === 'number')
                hiBuilder.startYear(startYear)
            if (typeof endYear === 'number')
                hiBuilder.endYear(endYear)
            if (typeof startMonth === 'string')
                hiBuilder.startMonth(startMonth)
            if (typeof endMonth === 'string')
                hiBuilder.endMonth(endMonth)
            headerInfos.push(hiBuilder.build())
        })
        stds.push(new StandardHeaderBuilder()
            .name(name)
            .reportDate(reportDate)
            .headerInfos(headerInfos)
            .unit(unit)
            .build())
    })
    return builder.standardHeaders(stds).build()
}

function buildBook(bookJson: unknown): Readonly<Book> | Exception {
    if (typeof bookJson !== 'object')
        return getBookException()
    const json = bookJson as JsonObj
    const builder = new BookBuilder()
    buildCommonAttrs(builder, json)
    const sheets: Readonly<Sheet>[] = []
    const subnodes = json.subnodes
    if (subnodes instanceof Array)
        subnodes.forEach(json => {
            const sheet = buildSheet(json)
            if (!isException(sheet))
                sheets.push(sheet)
        })
    builder.sheets(sheets)
    return builder.build()
}

function buildSheet(sheetJson: unknown): Readonly<Sheet> | Exception {
    if (typeof sheetJson !== 'object')
        return getBookException()
    const json = sheetJson as JsonObj
    const builder = new SheetBuilder()
    buildCommonAttrs(builder, json)
    const tree: Readonly<Table | Title>[] = []
    const subnodes = json.subnodes
    if (subnodes instanceof Array)
        subnodes.forEach(json => {
            const nodetype = json.nodetype
            let sub
            switch (nodetype) {
            case NodeType.TABLE:
                sub = buildTable(json)
                break
            case NodeType.TITLE:
                sub = buildTitle(json)
                break
            default:
            }
            if (!isException(sub) && sub !== undefined)
                tree.push(sub)
        })
    builder.tree(tree)
    return builder.build()
}

function buildTitle(titleJson: unknown): Readonly<Title> | Exception {
    if (typeof titleJson !== 'object')
        return getBookException()
    const json = titleJson as JsonObj
    const builder = new TitleBuilder()
    buildCommonAttrs(builder, json)
    const tree: Readonly<Table | Title>[] = []
    const subnodes = json.subnodes
    if (subnodes instanceof Array)
        subnodes.forEach(json => {
            const nodetype = json.nodetype
            let sub
            switch (nodetype) {
            case NodeType.TABLE:
                sub = buildTable(json)
                break
            case NodeType.TITLE:
                sub = buildTitle(json)
                break
            default:
            }
            if (!isException(sub) && sub !== undefined)
                tree.push(sub)
        })
    builder.tree(tree)
    return builder.build()
}

function buildTable(tableJson: unknown): Readonly<Table> | Exception {
    if (typeof tableJson !== 'object')
        return getBookException()
    const json = tableJson as JsonObj
    const builder = new TableBuilder()
    buildCommonAttrs(builder, json)
    const headerStub = json.headerStub
    if (typeof headerStub === 'string')
        builder.headerStub(headerStub)
    const referenceHeader = json.referenceHeader
    if (typeof referenceHeader === 'string')
        builder.referenceHeader(referenceHeader)
    const nodes: Readonly<Row | RowBlock | Column | ColumnBlock>[] = []
    const subnodes = json.subnodes
    if (subnodes instanceof Array)
        subnodes.forEach(json => {
            const nodetype = json.nodetype
            let sub
            switch (nodetype) {
            case NodeType.ROW:
                sub = buildRow(json)
                break
            case NodeType.ROW_BLOCK:
                sub = buildRowBlock(json)
                break
            case NodeType.COLUMN:
                sub = buildCol(json)
                break
            case NodeType.COLUMN_BLOCK:
                sub = buildColBlock(json)
                break
            default:
            }
            if (!isException(sub) && sub !== undefined)
                nodes.push(sub)
        })
    builder.subnodes(nodes)
    return builder.build()
}

function buildRow(rowJson: unknown): Readonly<Row> | Exception {
    if (typeof rowJson !== 'object')
        return getBookException()
    const json = rowJson as JsonObj
    const builder = new RowBuilder()
    buildCommonAttrs(builder, json)
    buildFormulaBearerAttrs(builder, json)
    const isDefScalar = json.isDefScalar
    if (typeof isDefScalar === 'boolean')
        builder.isDefScalar(isDefScalar)
    return builder.build()
}

function buildRowBlock(rowBlockJson: unknown): Readonly<RowBlock> | Exception {
    if (typeof rowBlockJson !== 'object')
        return getBookException()
    const json = rowBlockJson as JsonObj
    const builder = new RowBlockBuilder()
    buildCommonAttrs(builder, json)
    const tree: Readonly<Row | RowBlock>[] = []
    const subnodes = json.subnodes
    if (subnodes instanceof Array)
        subnodes.forEach(json => {
            const nodetype = json.nodetype
            let sub
            switch (nodetype) {
            case NodeType.ROW:
                sub = buildRow(json)
                break
            case NodeType.ROW_BLOCK:
                sub = buildRowBlock(json)
                break
            default:
            }
            if (!isException(sub) && sub !== undefined)
                tree.push(sub)
        })
    builder.tree(tree)
    return builder.build()
}

function buildCol(colJson: unknown): Readonly<Column> | Exception {
    if (typeof colJson !== 'object')
        return getBookException()
    const json = colJson as JsonObj
    const builder = new ColumnBuilder()
    buildCommonAttrs(builder, json)
    buildFormulaBearerAttrs(builder, json)
    return builder.build()
}

function buildColBlock(
    colBlockJson: unknown
): Readonly<ColumnBlock> | Exception {
    if (typeof colBlockJson !== 'object')
        return getBookException()
    const json = colBlockJson as JsonObj
    const builder = new ColumnBlockBuilder()
    buildCommonAttrs(builder, json)
    const tree: Readonly<Column | ColumnBlock>[] = []
    const subnodes = json.subnodes
    if (subnodes instanceof Array)
        subnodes.forEach(json => {
            const nodetype = json.nodetype
            let sub
            switch (nodetype) {
            case NodeType.COLUMN:
                sub = buildCol(json)
                break
            case NodeType.COLUMN_BLOCK:
                sub = buildColBlock(json)
                break
            default:
            }
            if (!isException(sub) && sub !== undefined)
                tree.push(sub)
        })
    builder.tree(tree)
    return builder.build()
}

function buildCommonAttrs<S extends Node, T extends NodeBuilder<S, S>>(
    builder: T,
    json: JsonObj,
): void {
    const uuid = json.uuid
    if (typeof uuid === 'string')
        builder.uuid(uuid)
    const name = json.name
    if (typeof name === 'string')
        builder.name(name)
    const labels = json.labels
    if (labels instanceof Array)
        builder.labels(labels)
    const annotations = json.annotations
    if (typeof annotations !== 'object' || annotations === null)
        return
    const map = buildAnnotations(annotations)
    builder.annotations(map)
}

function buildFormulaBearerAttrs<
    S extends FormulaBearer, T extends FormularBearerBuilder<S, S>>(
    builder: T,
    json: JsonObj,
): void {
    const expression = json.expression
    if (typeof expression === 'string')
        builder.expression(expression)
    const type = json.type
    if (typeof type === 'number')
        builder.type(type)
    const alias = json.alias
    if (typeof alias === 'string')
        builder.alias(alias)
    const separator = json.separator
    if (typeof separator === 'boolean')
        builder.separator(separator)
    const valid = json.valid
    if (typeof valid === 'boolean')
        builder.valid(valid)
    const sliceExprsJson = json.sliceExprs
    if (!(sliceExprsJson instanceof Array))
        return
    const sliceExprs: SliceExpr[] = []
    sliceExprsJson.forEach(slice => {
        const uuid = slice.uuid
        const type = slice.type
        const name = slice.name
        const expression = slice.expression
        if (typeof uuid !== 'string' || typeof type !== 'number' ||
            typeof name !== 'string' || typeof expression !== 'string')
            return
        const sliceBuilder = new SliceExprBuilder()
            .uuid(uuid)
            .type(type)
            .name(name)
            .expression(expression)
        const annotations = json.annotations
        if (typeof annotations === 'object' && annotations !== null) {
            const map = buildAnnotations(annotations)
            sliceBuilder.annotations(map)
        }
        sliceExprs.push(sliceBuilder.build())
    })
    builder.sliceExprs(sliceExprs)
}

// eslint-disable-next-line @typescript-eslint/ban-types
function buildAnnotations(json: object): Map<AnnotationKey, string> {
    const keys = Reflect.ownKeys(json)
    const map: Map<AnnotationKey, string> = new Map()
    keys.forEach(key => {
        const keyStr = key.toString()
        if (!isAnnotationKey(keyStr))
            return
        const value = Reflect.get(json, key)
        if (typeof value === 'string')
            map.set(keyStr, value)
    })
    return map
}

function getBookException(): Exception {
    return new ExceptionBuilder()
        .message('build hierarchy book failed in fromJson')
        .build()
}
