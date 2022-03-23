import {EditorServiceBuilder, handleAction} from '@logi/src/lib/api'

import {ActionBuilder} from './default_header'

describe('set active sheet', (): void => {
    it('test', (): void => {
        const service = new EditorServiceBuilder().build()
        const header = 'default-id'
        const action = new ActionBuilder().defaultHeader(header).build()
        handleAction(action, service)
        expect(service.templateSet.defaultHeader).toBe(header)
        const action2 = new ActionBuilder().build()
        handleAction(action2, service)
        expect(service.templateSet.defaultHeader).toBeUndefined()
    })
})
