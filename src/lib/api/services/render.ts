// tslint:disable-next-line: no-wildcard-import
import * as GC from '@grapecity/spread-sheets'
import {assertIsDefined} from '@logi/base/ts/common/assert'
import {Builder} from '@logi/base/ts/common/builder'
import {Notice} from '@logi/src/lib/api/notice'
import {
    ExprPlugin,
    HsfPlugin,
    PluginType,
    WorkbookPlugin,
} from '@logi/src/lib/api/plugins'
import {ExprManager} from '@logi/src/lib/dsl/semantic'
import {HsfManager} from '@logi/src/lib/hsf'
import {injectable} from 'inversify'
import {Subject} from 'rxjs'

import {LoaderService, LoaderServiceImpl} from './loader'

export interface RenderService extends LoaderService {
    readonly excel: GC.Spread.Sheets.Workbook
    readonly hsfManager: HsfManager
    readonly exprManager: ExprManager
}

@injectable()
export class RenderServiceImpl extends LoaderServiceImpl
    implements RenderService {
    public get hsfManager(): HsfManager {
        return this.hsfPlugin.hsfManager
    }

    public get exprManager(): ExprManager {
        return this.exprPlugin.exprManager
    }

    public get excel(): GC.Spread.Sheets.Workbook {
        return this.workbookPlugin.workbook
    }
    public constructor(public readonly pluginTypes: readonly PluginType[] = [
        PluginType.BOOK,
        PluginType.STD_HEADER,
        PluginType.SOURCE,
        PluginType.FORMULA,
        PluginType.MODIFIER,
        PluginType.HSF,
        PluginType.EXPR,
        PluginType.WORKBOOK,
        PluginType.DOWNLOAD,
    ]) {
        super(pluginTypes)
        this._initRenderPlugins()
    }
    public workbookPlugin!: WorkbookPlugin
    public hsfPlugin!: HsfPlugin
    public exprPlugin!: ExprPlugin

    public noticeEmitter$!: Subject<Notice>

    private _initRenderPlugins(): void {
        const expr = this.plugins.find(p => p instanceof ExprPlugin)
        assertIsDefined<ExprPlugin>(expr)
        this.exprPlugin = expr
        const hsf = this.plugins.find(p => p instanceof HsfPlugin)
        assertIsDefined<HsfPlugin>(hsf)
        this.hsfPlugin = hsf
        const workbook = this.plugins.find(p => p instanceof WorkbookPlugin)
        assertIsDefined<WorkbookPlugin>(workbook)
        this.workbookPlugin = workbook
    }
}

export class RenderServiceBuilder extends
    Builder<RenderService, RenderServiceImpl> {
    public constructor(obj?: Readonly<RenderService>) {
        const impl = new RenderServiceImpl()
        if (obj)
            RenderServiceBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}
