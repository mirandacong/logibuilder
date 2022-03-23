import {ItemBuilder, Manager} from './manager'
import {ManualSource, ManualSourceBuilder} from './manual'
import {SetSourceModificationBuilder} from './mods'

describe('set modification test', (): void => {
    let manager: Manager
    let rid: string
    let cid: string
    beforeEach((): void => {
        rid = 'row1'
        cid = 'col1'
        const item1 = new ItemBuilder()
            .row(rid)
            .col(cid)
            .source(buildSource(1))
            .build()
        manager = new Manager([item1])
    })
    it('undo and redo', (): void => {
        // tslint:disable-next-line: no-magic-numbers
        const newSource = buildSource(2)
        const mod1 = new SetSourceModificationBuilder()
            .row(rid)
            .col(cid)
            .source(newSource)
            .build()
        expect(manager.getSource(rid, cid)?.value).toEqual(1)
        mod1.do(manager)
        // tslint:disable-next-line: no-magic-numbers
        expect(manager.getSource(rid, cid)?.value).toEqual(2)
        mod1.undo(manager)
        expect(manager.getSource(rid, cid)?.value).toEqual(1)
    })
})

function buildSource(v: number): ManualSource {
    return new ManualSourceBuilder().value(v).build()
}
