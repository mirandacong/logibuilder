// tslint:disable: no-magic-numbers
import {
    BookBuilder,
    ColumnBuilder,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
} from '@logi/src/lib/hierarchy/core'
import {
    SourceManager,
    Item as SourceItem,
    ItemBuilder as SourceItemBuilder,
    ManualSourceBuilder,
} from '@logi/src/lib/source'
import {
    FormulaManager,
    FormulaItem,
    FormulaItemBuilder,
} from '@logi/src/lib/formula'

import {ModelBuilder} from './base'
import {fromJson} from './from_json'
import {toJson} from './to_json'
import {
    FontBuilder,
    FormatBuilder,
    Modifier,
    ModifierBuilder,
    ModifierManager,
} from '@logi/src/lib/modifier'
import {
    Frequency,
    HeaderInfoBuilder,
    ReportDateBuilder,
    StandardHeader,
    StandardHeaderBuilder,
    TemplateSetBuilder,
} from '@logi/src/lib/template'

// tslint:disable-next-line: max-func-body-length
describe('convert test', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('fromJson/toJson test', (): void => {
        const row = new RowBuilder().name('row').build()
        const row2 = new RowBuilder().name('row2').build()
        const col = new ColumnBuilder().name('col').build()
        const table = new TableBuilder()
            .name('table')
            .subnodes([row, row2, col])
            .build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const book = new BookBuilder().name('book').sheets([sheet]).build()

        const sItems: SourceItem[] = [
            new SourceItemBuilder()
                .row(row.uuid)
                .col(col.uuid)
                .source(new ManualSourceBuilder().value(1).build())
                .build(),
            new SourceItemBuilder()
                .row(row2.uuid)
                .col(col.uuid)
                .source(new ManualSourceBuilder().value('1').build())
                .build(),
        ]
        const sourceManager = new SourceManager(sItems)

        const fItems: FormulaItem[] = [new FormulaItemBuilder()
            .row(row.uuid)
            .col(col.uuid)
            .formula('formula')
            .build()]
        const formulaManager = new FormulaManager(fItems)

        const modifiers: Modifier[] = [new ModifierBuilder()
            .uuid(`${row.uuid}-${col.uuid}`)
            .font(new FontBuilder().bold(true).build())
            .format(new FormatBuilder().percent(true).build())
            .build()]
        const modifierManager = new ModifierManager(modifiers)

        const headers: StandardHeader[] = [
            new StandardHeaderBuilder()
                .name('header')
                .reportDate(
                    new ReportDateBuilder().year(2022).month(3).day(3).build()
                )
                .headerInfos([
                    new HeaderInfoBuilder()
                        .startYear(2020)
                        .endYear(2022)
                        .frequency(Frequency.YEAR)
                        .build(),
                    new HeaderInfoBuilder()
                        .startYear(2020)
                        .startMonth('Q1')
                        .endYear(2022)
                        .endMonth('Q3')
                        .frequency(Frequency.QUARTER)
                        .build(),
                ])
                .unit(1)
                .build(),
        ]
        const set = new TemplateSetBuilder().standardHeaders(headers).build()

        const modelOri = new ModelBuilder()
            .book(book)
            .sourceManager(sourceManager)
            .formulaManager(formulaManager)
            .modifierManager(modifierManager)
            .stdHeaderSet(set)
            .build()
        const jsonObj = toJson(modelOri)
        const model = fromJson(jsonObj)
        expect(model).toEqual(modelOri)
    })
})
