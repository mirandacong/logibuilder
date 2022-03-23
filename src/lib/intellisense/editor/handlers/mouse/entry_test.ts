import {Error, lex, Token} from '@logi/src/lib/dsl/lexer/v2'
import {BookBuilder} from '@logi/src/lib/hierarchy/core'

import {toDisplayUnit} from '../../display/convert'
import {EditorDisplayUnit} from '../../display/textbox/unit'
import {EditorLocation, EditorLocationBuilder} from '../../events/base'
import {EditorMouseEventBuilder} from '../../events/mouse'
import {StatusBuilder} from '../../status/entry'
import {TextStatusBuilder} from '../../status/textbox'

import {MouseEventHandler} from './entry'

describe('mouse event handler', (): void => {
    let location: EditorLocation
    beforeEach((): void => {
        const dummy = new BookBuilder().name('dummy').build()
        location = new EditorLocationBuilder().node(dummy).build()
    })
    it('click focus string only', (): void => {
        const text = '{A} + sum({B}, {C})'
        const event = new EditorMouseEventBuilder()
            .leftButton(true)
            .startOffset(1)
            .endOffset(1)
            .editorText(stringToUnits(text))
            .location(location)
            .build()
        const textStatus = new TextStatusBuilder()
            .text([])
            .endOffset(-1)
            .startOffset(-1)
            .build()
        const handler = new MouseEventHandler()
        const status = new StatusBuilder()
            .textStatus(textStatus)
            .location(location)
            .build()
        const result = handler.updateStatus(status, event)
        expect(result).toBeDefined()
        if (result === undefined)
            return
        expect(result.newStatus.textStatus.startOffset).toBe(1)
        expect(result.newStatus.textStatus.endOffset).toBe(1)
        expect(result.newStatus.textStatus.text.length).toBe(text.length)
    })
})

function stringToUnits(expression: string): readonly EditorDisplayUnit[] {
    const tokens = lex(expression)
    return tokens.map((
        t: Token | Error,
    ): EditorDisplayUnit => toDisplayUnit(t, []),
    )
}
