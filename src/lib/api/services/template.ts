import {assertIsDefined} from '@logi/base/ts/common/assert'
import {PluginType, TemplatePlugin} from '@logi/src/lib/api/plugins'
import {injectable} from 'inversify'

import {EditorService, EditorServiceImpl} from './editor'

export type TemplateService = EditorService

@injectable()
export class TemplateServiceImpl extends
    EditorServiceImpl implements TemplateService {
    public constructor(public readonly pluginTypes: readonly PluginType[] = [
        PluginType.TEMPLATE,
        PluginType.BOOK,
        PluginType.STD_HEADER,
        PluginType.SOURCE,
        PluginType.CLIPBOARD,
        PluginType.FORMULA,
        PluginType.MODIFIER,
        PluginType.EXPR,
        PluginType.HSF,
        PluginType.WORKBOOK,
        PluginType.DOWNLOAD,
        PluginType.FOCUS,
        PluginType.SHEET_TABS,
        PluginType.ERROR,
    ]) {
        super(pluginTypes)
        this._initArisPlugins()
    }

    /**
     * Used for simpe-editor.
     */
    public templatePlugin!: TemplatePlugin
    private _initArisPlugins(): void {
        const template = this.plugins.find(p => p instanceof TemplatePlugin)
        assertIsDefined<TemplatePlugin>(template)
        this.templatePlugin = template
    }
}
