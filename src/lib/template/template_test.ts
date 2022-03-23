import {SheetBuilder, TableBuilder} from '@logi/src/lib/hierarchy/core'

import {TemplateBuilder, Type} from './template'

describe('Template test: ', (): void => {
    it('basic properties test', (): void => {
        const table = new TableBuilder().name('table').build()
        const sheet = new SheetBuilder().name('sheet').tree([table]).build()
        const template = new TemplateBuilder().node(sheet).build()
        expect(template.node).toBe(sheet)
        expect(template.type).toBe(Type.TABLE)
    })
})
