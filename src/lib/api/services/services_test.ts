import {EditorServiceBuilder} from './editor'
import {LoaderServiceBuilder} from './loader'
import {RenderServiceBuilder} from './render'

describe('services test', (): void => {
    it('loader service should be built normally', (): void => {
        new LoaderServiceBuilder().build()
    })
    it('render service should be built normally', (): void => {
        new RenderServiceBuilder().build()
    })
    it('backend service should be built normally', (): void => {
        new EditorServiceBuilder().build()
    })
})
