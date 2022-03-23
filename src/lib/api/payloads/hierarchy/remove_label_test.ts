import {RowBuilder} from '@logi/src/lib/hierarchy/core'

import {removeLabel} from './remove_label'

describe('remove label handler test', (): void => {
    it('row', (): void => {
        const row = new RowBuilder().name('row').labels(['label']).build()
        removeLabel(row, 'label')
        expect(row.labels.length).toBe(0)
    })
})
