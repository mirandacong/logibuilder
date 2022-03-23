import {ViewPartBuilder, ViewType} from '@logi/src/lib/intellisense'
import {
    getViewPartClass,
} from '@logi/src/web/core/editor/logi-hierarchy/simple-editor/editor_base'

import {PART_MATCHED_CLASS, renderViewParts} from './render_view_parts'

// tslint:disable-next-line: max-func-body-length
describe('Suggestion panel utils test: ', (): void => {
    const matchedClass = PART_MATCHED_CLASS
    let sheetClass: string
    let tableClass: string
    let rowClass: string
    let funClass: string
    beforeEach((): void => {
        sheetClass = getViewPartClass(ViewType.SHEET) || ''
        tableClass = getViewPartClass(ViewType.TABLE) || ''
        rowClass = getViewPartClass(ViewType.ROW) || ''
        funClass = getViewPartClass(ViewType.FUNCTION) || ''
    })

    it('should render function parts', (): void => {
        const parts = [
            new ViewPartBuilder()
                .content('source()')
                .matchedMap(new Map<number, number>([[0, 1]]))
                .type(ViewType.FUNCTION)
                .build(),
        ]
        const content = renderViewParts(parts)
        const expected =
              `<span class='${funClass}'>`
                + `s<span class='${matchedClass}'>o</span>urce()`
            + '</span>'
        expect(content).toBe(expected)
    })

    it('should render single row part', (): void => {
        const parts = [
            new ViewPartBuilder()
                .content('row')
                .matchedMap(new Map<number, number>([[0, 0]]))
                .type(ViewType.ROW)
                .build(),
        ]
        const content = renderViewParts(parts)
        const expected = `<span class='${rowClass}'>`
            + `<span class='${matchedClass}'>r</span>ow</span>`
        expect(content).toBe(expected)
    })

    it('should render row with path', (): void => {
        const parts = [
            new ViewPartBuilder().content('table').type(ViewType.TABLE).build(),
            new ViewPartBuilder().content('sheet').type(ViewType.SHEET).build(),
            new ViewPartBuilder()
                .content('row')
                .matchedMap(new Map<number, number>([[0, 0]]))
                .type(ViewType.ROW)
                .build(),
        ]
        const content = renderViewParts(parts)
        const expected =
            `<span class='${sheetClass}'>sheet</span>!`
            + `<span class='${tableClass}'>table</span>!`
            + `<span class='${rowClass}'>`
                + `<span class='${matchedClass}'>r</span>ow`
            + '</span>'
        expect(content).toBe(expected)
    })
})
