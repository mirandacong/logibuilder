// tslint:disable: no-magic-numbers
import {buildTrie} from './build'
import {Node} from './node'

describe('build abbr_trie', (): void => {
    // tslint:disable-next-line: max-func-body-length
    it('test', (): void => {
        const data: string[] = [
            'Additional Inventory Items',
            'Assets',
            'Additional Paid In Capital',
            'Banana',
        ]
        const root: Node = buildTrie(data)
        const rootIndex = root.children.map((c: Node): string => c.word)
        expect(rootIndex).toEqual(['A', 'B'])
        const rootChildren1 = root.children[0]
        const rootChildren2 = root.children[1]
        expect(rootChildren1.children.map((c: Node): string => c.word))
            .toEqual(['dditional', 'ssets'])
        expect(rootChildren2.children.map((c: Node): string => c.word))
            .toEqual(['anana'])
    })
})
