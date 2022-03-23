// tslint:disable: no-magic-numbers
import {BookBuilder} from '@logi/src/lib/hierarchy/core'
import {
    CandidateBuilder,
    CandidateType,
} from '@logi/src/lib/intellisense/suggest/solutions'

import {EditorLocationBuilder} from '../../events/base'
import {Status, StatusBuilder} from '../../status/entry'
import {PanelStatusBuilder, PanelUnitBuilder} from '../../status/panel'
import {TextStatusBuilder} from '../../status/textbox'

import {
    addPair,
    addText,
    deleteText,
    isCursorInPair,
    isNextChar,
    jumpToNextWord,
    Orientation,
    selectCandidate,
} from './base'

// tslint:disable-next-line: max-func-body-length
describe('base action', (): void => {
    it('addText', (): void => {
        const status1 = new TextStatusBuilder()
            .text(['a', 'b'])
            .startOffset(1)
            .endOffset(1)
            .build()
        const result1 = addText(status1, 'a')
        expect(result1.text).toEqual(['a', 'a', 'b'])
        expect(result1.startOffset).toBe(2)
        const status2 = new TextStatusBuilder()
            .text(['a', 'b', 'c'])
            .startOffset(0)
            .endOffset(2)
            .build()
        const result2 = addText(status2, 'd')
        expect(result2.text).toEqual(['d', 'c'])
        expect(result2.startOffset).toEqual(1)
    })
    it('deleteText', (): void => {
        const status1 = new TextStatusBuilder()
            .text(['a', 'b'])
            .startOffset(1)
            .endOffset(1)
            .build()
        const result1 = deleteText(status1)
        expect(result1.text).toEqual(['b'])
        expect(result1.startOffset).toBe(0)
        const status2 = new TextStatusBuilder()
            .text(['a', 'b', 'c'])
            .endOffset(2)
            .startOffset(0)
            .build()
        const result2 = deleteText(status2)
        expect(result2.text).toEqual(['c'])
        expect(result2.startOffset).toBe(0)
    })
    it('jumpToNext', (): void => {
        const text = '{A} + {b} + {c}'.split('')
        const result = jumpToNextWord(Orientation.LEFT, text, 15)
        expect(result).toBe(13)
    })
    it('selectCandidate', (): void => {
        const node = new BookBuilder().name('dummy').build()
        const ref = '{candidate}'
        const txt = new TextStatusBuilder()
            .text([])
            .startOffset(1)
            .endOffset(1)
            .build()
        const candidate = new CandidateBuilder()
            .view([])
            .updateText(ref)
            .cursorOffest(9)
            .source(CandidateType.REFNAME)
            .build()
        const unit1 = new PanelUnitBuilder().parts([]).build()
        const unit2 = new PanelUnitBuilder().parts([]).entity(candidate).build()
        const panelStatus = new PanelStatusBuilder()
            .page([unit1, unit2])
            .selected(1)
            .build()
        const status = new StatusBuilder()
            .textStatus(txt)
            .panelStatus(panelStatus)
            .location(new EditorLocationBuilder().node(node).build())
            .build()
        const result = selectCandidate(status)
        expect(result.intellisense).toBe(false)
        expect(result.newStatus.textStatus.text).toEqual(ref.split(''))
    })
})

describe('util functions', (): void => {
    let status: Status
    beforeEach((): void => {
        const textStatus = new TextStatusBuilder()
            .text([])
            .startOffset(0)
            .endOffset(0)
            .build()
        const dummy = new BookBuilder().name('dummy').build()
        const location = new EditorLocationBuilder().node(dummy).build()
        status = new StatusBuilder()
            .textStatus(textStatus)
            .location(location)
            .build()
    })
    it('add pair & isCursorInPair', (): void => {
        const result = addPair(status, 'p', 'q')
        const newTxt = result.newStatus.textStatus
        expect(newTxt).toBeDefined()
        expect(newTxt.text.length).toBe(2)
        expect(newTxt.text).toEqual(['p', 'q'])
        expect(newTxt.endOffset).toBe(1)
        expect(newTxt.startOffset).toBe(1)
        const result2 = isCursorInPair(newTxt, 'p', 'q')
        expect(result2).toBe(true)
        const result3 = isNextChar(newTxt, 'q')
        expect(result3).toBe(true)
        const result4 = isNextChar(newTxt, 'p')
        expect(result4).toBe(false)
    })
})
