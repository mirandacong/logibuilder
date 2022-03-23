import {assertIsDefined} from '@logi/base/ts/common/assert'
import {EditorServiceBuilder} from '@logi/src/lib/api'
import {handleAction} from '@logi/src/lib/api/actions'
import {downloadLogi} from '@logi/src/lib/api/plugins'
import {buildTestModel} from '@logi/src/lib/dsl/logi_test_data'
import {ModelBuilder} from '@logi/src/lib/model'
import {
    ReportDateBuilder,
    StandardHeaderBuilder,
    TemplateSetBuilder,
} from '@logi/src/lib/template'

import {ActionBuilder} from './load_file'

describe('download and load file test', (): void => {
    it('logi1', async(): Promise<void> => {
        let model = buildTestModel()
        const book = model.book
        const sm = model.sourceManager
        const report = new ReportDateBuilder().build()
        const std = new StandardHeaderBuilder()
            .name('std')
            .reportDate(report)
            .build()
        const set = new TemplateSetBuilder().standardHeaders([std]).build()
        const service = new EditorServiceBuilder()
            .book(book)
            .sourceManager(sm)
            .templateSet(set)
            .build()
        model = new ModelBuilder(model).stdHeaderSet(set).build()
        const buffer = await downloadLogi(model).toPromise()
        assertIsDefined<Uint8Array>(buffer)
        const action = new ActionBuilder().buffer(buffer).build()
        handleAction(action, service)
        const newBook = service.book
        expect(newBook).toEqual(book)
        expect(service.templateSet.standardHeaders[0].name).toBe('std')
    })
})
