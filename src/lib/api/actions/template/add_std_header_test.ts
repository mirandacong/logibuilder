import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'
import {ReportDateBuilder, StandardHeaderBuilder} from '@logi/src/lib/template'

import {ActionBuilder} from './add_std_header'

// tslint:disable-next-line: max-func-body-length
describe('test add std header action', (): void => {
    it('add std header', (): void => {
        const service = new EditorServiceBuilder().build()
        const stdHeader = new StandardHeaderBuilder()
            .reportDate(new ReportDateBuilder().build())
            .name('std')
            .build()
        const action = new ActionBuilder().stdHeader(stdHeader).build()
        handleAction(action, service)
        expect(service.templateSet.standardHeaders.length).toBe(1)
        expect(service.templateSet.standardHeaders[0].name).toBe('std')
    })
})
