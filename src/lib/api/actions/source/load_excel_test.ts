import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {importBook} from '@logi/base/ts/spreadjs/spreadjs_sync_io'
import {EditorServiceBuilder} from '@logi/src/lib/api'
import {
    isSetFormulaPayload,
    isSetSourcePaylod,
    SetSourcePayload,
} from '@logi/src/lib/api/payloads'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {
    ALL_TYPES,
    BookBuilder,
    ColumnBuilder,
    getNodesVisitor,
    Node,
    RowBuilder,
    SheetBuilder,
    TableBuilder,
    Type,
} from '@logi/src/lib/hierarchy/core'
import {HsfManager} from '@logi/src/lib/hsf'
import {Model, ModelBuilder} from '@logi/src/lib/model'
import {
    ItemBuilder,
    ManualSourceBuilder,
    SetSourceModification,
    SetSourceModificationBuilder,
    SourceManager,
} from '@logi/src/lib/source'
import {readFileSync} from 'fs'
import {join} from 'path'
import {Subject} from 'rxjs'

import {handle} from '../handle'

import {ActionBuilder, getSheetSourcePayloads} from './load_excel'

// tslint:disable-next-line: max-func-body-length
describe('load excel test', (): void => {
    let model: Model
    let hsfManager: HsfManager
    let excelPath: string
    let exprManager: ExprManager
    let map!: Map<string, Readonly<Node>>
    beforeEach((): void => {
        model = buildModel()
        hsfManager = new HsfManager()
        excelPath = join(__dirname, './test.xlsx')
        exprManager = new ExprManager()
        exprManager.convert(model.book)
        map = new Map<string, Readonly<Node>>()
        const nodes = preOrderWalk(model.book, getNodesVisitor, ALL_TYPES)
        nodes.forEach(n => map.set(n.uuid, n))
    })
    it('update sources via loading excel', (): void => {
        const excel = importBook(excelPath)
        exprManager.convert(model.book)
        hsfManager.render(model, exprManager, map)
        const payloads = getSheetSourcePayloads(
            model.sourceManager,
            hsfManager,
            excel.sheets[1],
        )
        const mods = payloads.filter(isSetSourcePaylod).map(getModification)
        model.sourceManager.apply(mods)
        const s1 = model.sourceManager.getSource('row1', 'col')
        expect(s1?.value).toEqual(1)
        const s2 = model.sourceManager.getSource('row2', 'col')
        // tslint:disable: no-magic-numbers
        expect(s2?.value).toEqual(2)

        const setFormula = payloads.filter(isSetFormulaPayload)
        model.formulaManager.setFormula(
            setFormula[0].row,
            setFormula[0].col,
            setFormula[0].formula,
        )
        expect(model.formulaManager.getFormula('row3', 'col')).toBe('B5')
    })
    it('load excel action', async(): Promise<void> => {
        const service = new EditorServiceBuilder()
            .book(model.book)
            .sourceManager(model.sourceManager)
            .build()
        service.exprManager.convert(model.book)
        service.hsfManager.render(model, exprManager, map)
        const hsf$ = new Subject<number>()
        const source$ = new Subject<number>()
        const formula$ = new Subject<number>()
        service.getEmitters().excelEmitter.subscribe((): void => {
            expect(service.excel.sheets.length)
                .toBe(service.book.sheets.length + 1)
            hsf$.complete()
        })
        service.getEmitters().sourceEmitter.subscribe((): void => {
            expect(service.sourceManager.getSource('row2', 'col')?.value)
                .toEqual(2)
            expect(service.sourceManager.getSource('row4', 'col')?.value)
                .toEqual(4)
            source$.complete()
        })
        service.getEmitters().formulaEmitter.subscribe((): void => {
            expect(service.formulaManager.getFormula('row3', 'col')).toBe('B5')
            formula$.complete()
        })
        const buf = readFileSync(excelPath).buffer
        const action = new ActionBuilder().excel(buf).build()
        handle(action, service)
        await hsf$.toPromise()
        await source$.toPromise()
        await formula$.toPromise()
    })
})

// tslint:disable-next-line: max-func-body-length
function buildModel(): Model {
    const row1 = new RowBuilder()
        .uuid('row1')
        .type(Type.FX)
        .name('row1')
        .build()
    const row2 = new RowBuilder()
        .uuid('row2')
        .name('row2')
        .type(Type.ASSUMPTION)
        .build()
    const row3 = new RowBuilder()
        .uuid('row3')
        .name('row3')
        .type(Type.ASSUMPTION)
        .build()
    const row4 = new RowBuilder()
        .uuid('row4')
        .name('row4')
        .type(Type.FACT)
        .build()
    const column = new ColumnBuilder().uuid('col').name('column').build()
    const table = new TableBuilder()
        .headerStub('Table')
        .name('table')
        .subnodes([row1, row2, row3, row4, column])
        .build()
    const sheet = new SheetBuilder().tree([table]).name('Sheet1').build()
    const book = new BookBuilder()
        .uuid('uuid')
        .name('book')
        .sheets([sheet])
        .build()
    const source1 = new ManualSourceBuilder().value(1).build()
    // tslint:disable-next-line: no-magic-numbers
    const source2 = new ManualSourceBuilder().value(100).build()
    const source4 = new ManualSourceBuilder().value(100).build()
    const item1 = new ItemBuilder()
        .row('row1')
        .col('col')
        .source(source1)
        .build()
    const item2 = new ItemBuilder()
        .row('row2')
        .col('col')
        .source(source2)
        .build()
    const item4 = new ItemBuilder()
        .row('row4')
        .col('col')
        .source(source4)
        .build()
    const sourceManager = new SourceManager([item1, item2, item4])
    return new ModelBuilder().book(book).sourceManager(sourceManager).build()
}

function getModification(p: SetSourcePayload): Readonly<SetSourceModification> {
    return new SetSourceModificationBuilder()
        .row(p.row)
        .col(p.col)
        .source(p.source)
        .build()
}
