import {readFileSync} from 'fs'
import {join} from 'path'

import {ContextSeekerBuilder} from './seeker'


describe('context intellisense', (): void => {
    it('recommend top word', (): void => {
        const file = 'testdata.txt'
        const data = readFileSync(join(__dirname, file)).toString().split('\n')
        const seeker = new ContextSeekerBuilder().data(data).build()
        const targets = seeker.seek(['fruit', 'pear'])
        expect(targets[0].content).toBe('apple')
    })
})
