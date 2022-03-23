import {assertIsDefined} from '@logi/base/ts/common/assert'
import {Builder} from '@logi/base/ts/common/builder'
import {PluginType, SourcePlaygoundPlugin} from '@logi/src/lib/api/plugins'
import {FormulaManager} from '@logi/src/lib/formula'
import {Book} from '@logi/src/lib/hierarchy/core'
import {convertToExcel} from '@logi/src/lib/hsf'
import {ModelBuilder} from '@logi/src/lib/model'
import {SourceManager} from '@logi/src/lib/source'
import {TemplateSet} from '@logi/src/lib/template'
import {injectable} from 'inversify'

import {EditorService, EditorServiceImpl} from './editor'

export interface ProjectService extends EditorService {
    readonly playground: SourcePlaygoundPlugin
}

@injectable()
export class ProjectServiceImpl
    extends EditorServiceImpl implements ProjectService {
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
        PluginType.SOURCE_PLAYGROUND,
    ]) {
        super(pluginTypes)
        this._initArisPlugins()
    }
    public playground!: SourcePlaygoundPlugin

    private _initArisPlugins(): void {
        const playground = this.plugins
            .find(p => p instanceof SourcePlaygoundPlugin)
        assertIsDefined<SourcePlaygoundPlugin>(playground)
        this.playground = playground
    }
}

export class ProjectServiceBuilder extends
    Builder<ProjectService, ProjectServiceImpl> {
    public constructor(obj?: Readonly<ProjectService>) {
        const impl = new ProjectServiceImpl()
        if (obj)
            ProjectServiceBuilder.shallowCopy(impl, obj)
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
}
