import {EditorDisplayUnit, UnitType} from '@logi/src/lib/intellisense'

import {getUnitClass} from './unit_class_map'

/**
 * convert editorDisplayUnit to html string
 */
export function renderContent(units: readonly EditorDisplayUnit[]): string {
    let text = ''
    units.forEach((unit: EditorDisplayUnit): void => {
        const classList = unit.tags
            .map((tag: UnitType): string => getUnitClass(tag) || '')
            .filter((c: string): boolean => c.length > 0)
            .join(' ')
            /**
             * Replace backspace(' ') with `&nbsp;`.
             */
        if (unit.tags.includes(UnitType.WS_SEQ)) {
            const bs = unit.content.replace(/\s/g, '&nbsp;')
            text += `<span class='${classList}'>${bs}</span>`
            return
        }
        text += `<span class='${classList}'>${unit.content}</span>`
    })
    /**
         * TODO (libiao): Find another way.
         */
    // tslint:disable-next-line: no-inner-html
    return text
}
