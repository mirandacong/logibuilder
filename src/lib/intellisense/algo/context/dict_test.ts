import {readFileSync} from 'fs'
import {join} from 'path'

import {buildDict} from './dict'
import {Node} from './node'

describe(('build Dict'), (): void => {
    it('testdata', (): void => {
        const file = './testdata.txt'
        const data = readFileSync(join(__dirname, file)).toString().split('\n')
        const dict = buildDict(data)
        const actualPhrases = ['banana', 'apple', 'monkey', 'fruit', 'pear']
        const nodes = dict.array
        expect(nodes.map((node: Node): string => node.phrase))
            .toEqual(actualPhrases)
    })
})
