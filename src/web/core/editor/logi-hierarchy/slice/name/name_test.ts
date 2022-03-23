import {NameService} from './service'
import {Span, SpanBuilder, SpanType} from './span'

const SPANS = '预测期 AND'
describe('service test: ', (): void => {
    let service: NameService
    const stringSpans = SPANS
    let spanSpans: Span[]
    beforeEach((): void => {
        service = new NameService()
        spanSpans = getSpans()
    })
    it('init spans', (): void => {
        service.init(stringSpans)
        const curr = service.getCurrText()
        expect(curr).toEqual(getSpans())
    })

    it('get name list', (): void => {
        service.setCurrtText(spanSpans)
        const nameList = service.getNameList()
        expect(nameList).toEqual('预测期 AND ')
    })
    it('remove span and clean span', (): void => {
        service.setCurrtText(spanSpans)
        service.remove(spanSpans[1])
        expect(service.getCurrText()).toEqual([spanSpans[0]])
        service.clean()
        expect(service.getCurrText()).toEqual([])
    })
    it('reset span', (): void => {
        const s = new SpanBuilder().text('历史期').type(SpanType.NAME).build()
        service.reset(s.text)
        expect(service.getCurrText()).toEqual([s])
    })
    it('set span', (): void => {
        service.setName('预测期', SpanType.NAME)
        service.setName('与', SpanType.OPERATOR)
        expect(service.getCurrText()).toEqual(spanSpans)
    })
})

// tslint:disable-next-line: readonly-array
function getSpans(): Span[] {
    return [
        new SpanBuilder().text('预测期').type(SpanType.NAME).build(),
        new SpanBuilder().text('与').type(SpanType.OPERATOR).build(),
    ]
}
