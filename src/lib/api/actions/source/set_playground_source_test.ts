import {ProjectService, ProjectServiceBuilder} from '@logi/src/lib/api'
import {handleAction, LoadModelActionBuilder} from '@logi/src/lib/api/actions'
import {buildTestModel3} from '@logi/src/lib/dsl/logi_test_data'
import {Table} from '@logi/src/lib/hierarchy/core'

import {ActionBuilder as ConfirmActionBuilder} from './confirm_playground'
import {ActionBuilder} from './set_playground_source'

describe('set playground source test', (): void => {
    let service: ProjectService
    beforeEach((): void => {
        const model = buildTestModel3()
        service = new ProjectServiceBuilder().build()
        const loadAction = new LoadModelActionBuilder().model(model).build()
        handleAction(loadAction, service)
    })
    it('change the first row and the first column, from 1 to 0.', (): void => {
        service.getEmitters().sourcePlaygroundEmitter.subscribe(r => {
            if (r.changed.length > 0)
                // tslint:disable-next-line: no-magic-numbers
                expect(r.changed.length).toBe(4)
        })
        // tslint:disable-next-line: no-type-assertion
        const table = service.book.sheets[0].tree[0] as Readonly<Table>
        const row1 = table.getLeafRows()[0]
        const col1 = table.getLeafCols()[0]
        const action = new ActionBuilder()
            .row(row1.uuid)
            .col(col1.uuid)
            .value(0)
            .build()
        handleAction(action, service)
        expect(service.playground.historyStorage.size).toBe(1)
        const confirm = new ConfirmActionBuilder().build()
        handleAction(confirm, service)
        expect(service.playground.historyStorage.size).toBe(0)
    })
})
