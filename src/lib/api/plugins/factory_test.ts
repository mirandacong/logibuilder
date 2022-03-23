import {isException} from '@logi/base/ts/common/exception'
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

import {PluginType} from './base'
import {ERR_SUBJECT, getPluginsAndEmitters} from './factory'

// tslint:disable-next-line: max-func-body-length
describe('registry test', (): void => {
    it('', (): void => {
        const types = [
            PluginType.BOOK,
            PluginType.DOWNLOAD,
            PluginType.EXPR,
            PluginType.FOCUS,
            PluginType.FORMULA,
            PluginType.HSF,
            PluginType.MODIFIER,
            PluginType.SHEET_TABS,
            PluginType.SOURCE,
            PluginType.CLIPBOARD,
            PluginType.STD_HEADER,
            PluginType.WORKBOOK,
        ]
        const result = getPluginsAndEmitters(types)
        expect(isException(result)).toBe(false)
        if (isException(result))
            return
        expect(result[0].length).toBe(types.length)
    })
    it('', (): void => {
        const types = [
            PluginType.BOOK,
            PluginType.STD_HEADER,
            PluginType.SOURCE,
            PluginType.FORMULA,
            PluginType.MODIFIER,
        ]
        const result = getPluginsAndEmitters(types)
        expect(isException(result)).toBe(false)
        if (isException(result))
            return
        expect(result[0].length).toBe(types.length)
        expect(result[1].downloadEmitter).toBe(ERR_SUBJECT)
    })
    it('', (): void => {
        const types = [
            PluginType.BOOK,
            PluginType.STD_HEADER,
            PluginType.SOURCE,
            PluginType.FORMULA,
            PluginType.MODIFIER,
            PluginType.HSF,
            PluginType.EXPR,
            PluginType.WORKBOOK,
            PluginType.DOWNLOAD,
        ]
        const result = getPluginsAndEmitters(types)
        expect(isException(result)).toBe(false)
        if (isException(result))
            return
        expect(result[0].length).toBe(types.length)
    })
})
