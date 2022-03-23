import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {postOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    FormulaItem,
    FormulaItemBuilder,
    FormulaManager,
} from '@logi/src/lib/formula'
import {
    AnnotationKey,
    BookBuilder,
    Column,
    ColumnBlock,
    ColumnBlockBuilder,
    ColumnBuilder,
    getSubnodes,
    isBook,
    isColumn,
    isColumnBlock,
    isRow,
    isRowBlock,
    isSheet,
    isTable,
    isTitle,
    Node,
    Row,
    RowBlock,
    RowBlockBuilder,
    RowBuilder,
    Sheet,
    SheetBuilder,
    SliceExpr,
    SliceExprBuilder,
    Table,
    TableBuilder,
    Title,
    TitleBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    FontBuilder,
    FormatBuilder,
    Modifier,
    ModifierBuilder,
    ModifierManager,
} from '@logi/src/lib/modifier'
import {
    DatabaseSourceBuilder,
    isDatabaseSource ,
    isManualSource,
    Item as SourceItem,
    ItemBuilder as SourceItemBuilder,
    ManualSourceBuilder,
    Source,
    SourceManager,
} from '@logi/src/lib/source'
import {
    TemplateSet,
    TemplateSetBuilder,
    StandardHeaderBuilder,
    ReportDateBuilder,
    HeaderInfoBuilder,
} from '@logi/src/lib/template'

export function getCloneResult<T extends Node>(
    // tslint:disable-next-line: max-params
    node: Readonly<T>,
    modifierManager: ModifierManager,
    sourceManager: SourceManager,
    formulaManager: FormulaManager,
    config = new ConfigBuilder().build(),
): CloneResult<T> {
    const uuidMap = new Map<string, string>()
    const clonedNode = cloneHierarchy(node, config, uuidMap)
    const fm = cloneFormula(formulaManager, uuidMap)
    const mm = cloneModifier(modifierManager, uuidMap)
    const sm = cloneSource(sourceManager, uuidMap)
    return new CloneResultBuilder<T>()
        .clonedNode(clonedNode)
        .modifiers(mm.getModifers())
        .formulaItems(fm.data)
        .sourceItems(sm.data)
        .build()
}

export interface CloneResult<T extends Node> {
    readonly clonedNode: Readonly<T>
    readonly sourceItems: readonly SourceItem[]
    readonly formulaItems: readonly FormulaItem[]
    readonly modifiers: readonly Modifier[]
}

class CloneResultImpl<T extends Node> implements CloneResult<T> {
    public clonedNode!: Readonly<T>
    public sourceItems: readonly SourceItem[] = []
    public formulaItems: readonly FormulaItem[] = []
    public modifiers: readonly Modifier[] = []
}

export class CloneResultBuilder<T extends Node> extends
    Builder<CloneResult<T>, CloneResultImpl<T>> {
    public constructor(obj?: Readonly<CloneResult<T>>) {
        const impl = new CloneResultImpl<T>()
        if (obj)
            CloneResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public clonedNode(clonedNode: Readonly<T>): this {
        this.getImpl().clonedNode = clonedNode
        return this
    }

    public sourceItems(sourceItems: readonly SourceItem[]): this {
        this.getImpl().sourceItems = sourceItems
        return this
    }

    public formulaItems(formulaItems: readonly FormulaItem[]): this {
        this.getImpl().formulaItems = formulaItems
        return this
    }

    public modifiers(modifiers: readonly Modifier[]): this {
        this.getImpl().modifiers = modifiers
        return this
    }

    protected get daa(): readonly string[] {
        return CloneResultBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'clonedNode',
    ]
}

export function cloneFormula(
    fm: FormulaManager,
    uuidMap: Map<string, string>,
): FormulaManager {
    const data: FormulaItem[] = []
    fm.data.forEach((item: FormulaItem): void => {
        let col = uuidMap.get(item.col)
        let row = uuidMap.get(item.row)
        if (col === undefined && row === undefined)
            return
        col = col ?? item.col
        row = row ?? item.row
        data.push(new FormulaItemBuilder()
            .col(col)
            .row(row)
            .formula(item.formula)
            .build())
    })
    return new FormulaManager(data)
}

export function cloneModifier(
    mm: ModifierManager,
    uuidMap: Map<string, string>,
): ModifierManager {
    const ms: Modifier[] = []
    mm.getModifers().forEach((m: Modifier): void => {
        const row = uuidMap.get(m.uuid)
        if (row === undefined)
            return
        const font = new FontBuilder(m.font).build()
        const format = new FormatBuilder(m.format).build()
        ms.push(new ModifierBuilder()
            .uuid(row)
            .format(format)
            .font(font)
            .build())
    })
    return new ModifierManager(ms)
}

export function cloneSource(
    sm: SourceManager,
    uuidMap: Map<string, string>,
    config = new ConfigBuilder().build(),
): SourceManager {
    const data: SourceItem[] = []
    sm.data.forEach((item: SourceItem): void => {
        let col = uuidMap.get(item.col)
        let row = uuidMap.get(item.row)
        if (col === undefined && row === undefined)
            return
        col = col ?? item.col
        row = row ?? item.row
        let s: Source | undefined
        if (isDatabaseSource(item.source) && config.cloneDatabaseSource)
            s = new DatabaseSourceBuilder().value(item.source.value).build()
        if (isManualSource(item.source))
            s = new ManualSourceBuilder().value(item.source.value).build()
        if (s === undefined)
            return
        data.push(new SourceItemBuilder().col(col).row(row).source(s).build())
    })
    return new SourceManager(data)
}

export function cloneStdHeaderSet(set: TemplateSet): TemplateSet {
    const headers = set.standardHeaders.map(h => {
        const reportDate = new ReportDateBuilder(h.reportDate).build()
        const his = h.headerInfos.map(hi => new HeaderInfoBuilder(hi).build())
        return new StandardHeaderBuilder()
            .name(h.name)
            .reportDate(reportDate)
            .headerInfos(his)
            .build()
    })
    return new TemplateSetBuilder()
        .defaultHeader(set.defaultHeader)
        .standardHeaders(headers)
        .build()
}

/**
 * The function of hierarchy tree deep clone.
 *
 * NOTE: Default config clones reference header in table.
 */
export function cloneHierarchy<T extends Node>(
    node: Readonly<T>,
    config = new ConfigBuilder().build(),
    uuidMap = new Map<string, string>(),
): Readonly<T> {
    const walkData = new WalkDataBuilder()
        .map(new Map<Readonly<Node>, Readonly<Node>>())
        .root(node)
        .config(config)
        .build()
    postOrderWalk(node, visitor, getSubnodes, walkData)
    const newNode = walkData.map.get(node)
    walkData.map.forEach((
        cloned: Readonly<Node>,
        ori: Readonly<Node>,
    ): void => {
        uuidMap.set(ori.uuid, cloned.uuid)
    })
    // tslint:disable-next-line: no-type-assertion
    return newNode === undefined ? node : newNode as T
}

interface WalkData {
    readonly map: Map<Readonly<Node>, Readonly<Node>>
    readonly root: Readonly<Node>
    readonly config: Config
}

class WalkDataImpl implements Impl<WalkData> {
    public map!: Map<Readonly<Node>, Readonly<Node>>
    public root!: Readonly<Node>
    public config!: Config
}

class WalkDataBuilder extends Builder<WalkData, WalkDataImpl> {
    public constructor(obj?: Readonly<WalkData>) {
        const impl = new WalkDataImpl()
        if (obj)
            WalkDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public map(map: Map<Readonly<Node>, Readonly<Node>>): this {
        this.getImpl().map = map
        return this
    }

    public root(root: Readonly<Node>): this {
        this.getImpl().root = root
        return this
    }

    public config(config: Config): this {
        this.getImpl().config = config
        return this
    }

    protected get daa(): readonly string[] {
        return WalkDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] =
        ['map', 'root', 'config']
}

// tslint:disable-next-line: max-func-body-length cyclomatic-complexity
function visitor(
    node: Readonly<Node>,
    walkData: WalkData,
): readonly Readonly<Node>[] {
    const map = walkData.map
    let newNode: Readonly<Node>
    if (isBook(node)) {
        const sheets: Readonly<Sheet>[] = []
        node.sheets.forEach((sub: Readonly<Sheet>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !isSheet(newSub))
                return
            sheets.push(newSub)
        })
        newNode = new BookBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .name(node.name)
            .labels(node.labels.slice())
            .sheets(sheets)
            .build()
    } else if (isSheet(node)) {
        const tree: Readonly<Table | Title>[] = []
        node.tree.forEach((sub: Readonly<Table | Title>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !(isTable(newSub) || isTitle(newSub)))
                return
            tree.push(newSub)
        })
        newNode = new SheetBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .name(node.name)
            .labels(node.labels.slice())
            .tree(tree)
            .build()
    } else if (isTitle(node)) {
        const tree: Readonly<Table | Title>[] = []
        node.tree.forEach((sub: Readonly<Table | Title>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !(isTable(newSub) || isTitle(newSub)))
                return
            tree.push(newSub)
        })
        newNode = new TitleBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .name(node.name)
            .labels(node.labels.slice())
            .tree(tree)
            .build()
    } else if (isTable(node)) {
        const newRows: Readonly<Row | RowBlock>[] = []
        node.rows.forEach((sub: Readonly<RowBlock | Row>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !(isRow(newSub) || isRowBlock(newSub)))
                return
            newRows.push(newSub)
        })
        const newCols: Readonly<Column | ColumnBlock>[] = []
        node.cols.forEach((sub: Readonly<Column | ColumnBlock>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !(isColumn(newSub) || isColumnBlock(
                newSub,
            )))
                return
            newCols.push(newSub)
        })
        const newTable = new TableBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .name(node.name)
            .headerStub(node.headerStub)
            .subnodes([...newRows, ...newCols])
            .labels(node.labels.slice())
        if (node.referenceHeader !== undefined &&
            walkData.config.cloneReferenceHeader)
            newTable.referenceHeader(node.referenceHeader)
        newNode = newTable.build()
    } else if (isRowBlock(node)) {
        const tree: Readonly<Row | RowBlock>[] = []
        node.tree.forEach((sub: Readonly<Row | RowBlock>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !(isRow(newSub) || isRowBlock(newSub)))
                return
            tree.push(newSub)
        })
        newNode = new RowBlockBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .name(node.name)
            .labels(node.labels.slice())
            .tree(tree)
            .build()
    } else if (isRow(node)) {
        const expression = node.expression
        const slices = node.sliceExprs
            .map((sliceExpr: SliceExpr): SliceExpr => new SliceExprBuilder()
                .name(sliceExpr.name)
                .annotations(cloneAnnotation(sliceExpr.annotations))
                .expression(sliceExpr.expression)
                .type(sliceExpr.type)
                .build())
        const newRow = new RowBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .name(node.name)
            .expression(expression)
            .isDefScalar(node.isDefScalar)
            .labels(node.labels.slice())
            .sliceExprs(slices)
            .type(node.type)
            .alias(node.alias)
            .valid(node.valid)
            .separator(node.separator)
        newNode = newRow.build()
    } else if (isColumnBlock(node)) {
        const tree: Readonly<Column | ColumnBlock>[] = []
        node.tree.forEach((sub: Readonly<Column | ColumnBlock>): void => {
            const newSub = walkData.map.get(sub)
            if (newSub === undefined || !(isColumn(newSub) || isColumnBlock(
                newSub,
            )))
                return
            tree.push(newSub)
        })
        newNode = new ColumnBlockBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .labels(node.labels.slice())
            .name(node.name)
            .tree(tree)
            .build()
    } else if (isColumn(node)) {
        const expression = node.expression
        const slices = node.sliceExprs
            .map((sliceExpr: SliceExpr): SliceExpr => new SliceExprBuilder()
                .name(sliceExpr.name)
                .annotations(cloneAnnotation(sliceExpr.annotations))
                .expression(sliceExpr.expression)
                .type(sliceExpr.type)
                .build())
        const newCol = new ColumnBuilder()
            .annotations(cloneAnnotation(node.annotations))
            .expression(expression)
            .labels(node.labels.slice())
            .name(node.name)
            .type(node.type)
            .sliceExprs(slices)
            .alias(node.alias)
            .valid(node.valid)
            .separator(node.separator)
        newNode = newCol.build()
    } else
        newNode = node
    map.set(node, newNode)
    return [newNode]
}

function cloneAnnotation(
    map: ReadonlyMap<AnnotationKey, string>,
): Map<AnnotationKey, string> {
    const newMap = new Map<AnnotationKey, string>()
    map.forEach((v: string, k: AnnotationKey): void => {
        newMap.set(k, v)
    })
    return newMap
}

/**
 * The config of deep clone hierarchy tree.
 */
export interface Config {
    readonly cloneReferenceHeader: boolean
    readonly cloneDatabaseSource: boolean
}

class ConfigImpl implements Config {
    public cloneReferenceHeader = true
    public cloneDatabaseSource = true
}

// tslint:disable-next-line: max-classes-per-file
export class ConfigBuilder extends Builder<Config, ConfigImpl> {
    public constructor(obj?: Readonly<Config>) {
        const impl = new ConfigImpl()
        if (obj)
            ConfigBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public cloneReferenceHeader(cloneReferenceHeader: boolean): this {
        this.getImpl().cloneReferenceHeader = cloneReferenceHeader
        return this
    }

    public cloneDatabaseSource(cloneDatabaseSource: boolean): this {
        this.getImpl().cloneDatabaseSource = cloneDatabaseSource
        return this
    }
}
// tslint:disable-next-line: max-file-line-count
