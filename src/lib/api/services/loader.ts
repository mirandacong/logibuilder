import {assertIsDefined} from '@logi/base/ts/common/assert'
import {Builder} from '@logi/base/ts/common/builder'
import {Notice} from '@logi/src/lib/api/notice'
import {
    BookPlugin,
    FormulaPlugin,
    ModifierPlugin,
    PluginType,
    SourcePlugin,
    StdHeaderPlugin,
} from '@logi/src/lib/api/plugins'
import {FormulaManager} from '@logi/src/lib/formula'
import {Book, Node} from '@logi/src/lib/hierarchy/core'
import {ModifierManager} from '@logi/src/lib/modifier'
import {SourceManager} from '@logi/src/lib/source'
import {TemplateSet} from '@logi/src/lib/template'
import {injectable} from 'inversify'
import {Subject} from 'rxjs'

import {BaseService, BaseServiceImpl} from './base'

/**
 * A service used for decoding a model.
 */
export interface LoaderService extends BaseService {
    readonly book: Readonly<Book>
    readonly templateSet: Readonly<TemplateSet>
    readonly sourceManager: SourceManager
    readonly formulaManager: FormulaManager
    readonly modifierManager: ModifierManager
    readonly bookMap: Map<string, Readonly<Node>>
    /**
     * Record the sub undo that has changed.
     */
    recordUndo(types: readonly PluginType[]): void
}

@injectable()
export class LoaderServiceImpl
    extends BaseServiceImpl implements LoaderService {
    public get book(): Readonly<Book> {
        return this.bookPlugin.book
    }

    public get sourceManager(): SourceManager {
        return this.sourcePlugin.sourceManager
    }

    public get formulaManager(): FormulaManager {
        return this.formulaPlugin.formulaManager
    }

    public get modifierManager(): ModifierManager {
        return this.modifierPlugin.modifierManager
    }

    public get templateSet(): TemplateSet {
        return this.stdHeaderPlugin.templateSet
    }

    public get bookMap(): Map<string, Readonly<Node>> {
        return this.bookPlugin.nodesMap
    }
    public constructor(public readonly pluginTypes: readonly PluginType[] = [
        PluginType.BOOK,
        PluginType.STD_HEADER,
        PluginType.SOURCE,
        PluginType.FORMULA,
        PluginType.MODIFIER,
    ]) {
        super(pluginTypes)
        this._initLoaderPlugins()
    }
    public noticeEmitter$!: Subject<Notice>

    public bookPlugin!: BookPlugin
    public stdHeaderPlugin!: StdHeaderPlugin
    public sourcePlugin!: SourcePlugin
    public formulaPlugin!: FormulaPlugin
    public modifierPlugin!: ModifierPlugin

    private _initLoaderPlugins(): void {
        const book = this.plugins.find(p => p instanceof BookPlugin)
        assertIsDefined<BookPlugin>(book)
        this.bookPlugin = book
        const tmpl = this.plugins.find(p => p instanceof StdHeaderPlugin)
        assertIsDefined<StdHeaderPlugin>(tmpl)
        this.stdHeaderPlugin = tmpl
        const src = this.plugins.find(p => p instanceof SourcePlugin)
        assertIsDefined<SourcePlugin>(src)
        this.sourcePlugin = src
        const formula = this.plugins.find(p => p instanceof FormulaPlugin)
        assertIsDefined<FormulaPlugin>(formula)
        this.formulaPlugin = formula
        const modifier = this.plugins.find(p => p instanceof ModifierPlugin)
        assertIsDefined<ModifierPlugin>(modifier)
        this.modifierPlugin = modifier
    }
}

export class LoaderServiceBuilder extends
    Builder<LoaderService, LoaderServiceImpl> {
    public constructor(obj?: Readonly<LoaderService>) {
        const impl = new LoaderServiceImpl()
        if (obj)
            LoaderServiceBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}
