import {RowBuilder} from '@logi/src/lib/hierarchy/core'

import {addLabel} from './add_label'

describe('add label handler test', (): void => {
    it('row', (): void => {
        const row = new RowBuilder().name('row').labels(['label']).build()
        addLabel(row, 'addLabel')
        // tslint:disable-next-line: no-magic-numbers
        expect(row.labels.length).toBe(2)
        expect(row.labels).toEqual(['label', 'addLabel'])
    })
})
