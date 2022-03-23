import {AdviserBuilder} from '../adviser'
import {Hint} from '../input'
import {Candidate, CandidateType} from '../solutions/candidate'

import {readHints} from './data'

describe('adviser', (): void => {
    it('connect', (): void => {
        const input = readHints()
        const adviser = new AdviserBuilder().dict([]).build()

        const funcOrRef = adviser.getSuggestion(input[0])
        // tslint:disable-next-line: no-magic-numbers
        expect(funcOrRef.candidateGroups.length).toBe(3)
        const funcOrRefMembers = funcOrRef.candidateGroups[0].members
        testMembers(funcOrRefMembers, input[0])
        expect(funcOrRef.candidateGroups[1].members.length).toBe(0)
        input.slice(1).forEach((i: Hint): void => {
            const suggestion = adviser.getSuggestion(i)
            expect(suggestion.candidateGroups.length).toBe(1)
            const members = suggestion.candidateGroups[0].members
            testMembers(members, i)
        })
    })

    function testMembers(members: readonly Candidate[], i: Hint): void {
        members.forEach((m: Candidate): void => {
            expect(m.suffix).toEqual(i.suffix)
            expect(m.prefix).toEqual(i.prefix)
            expect(m.view.length).toBeGreaterThan(0)
            if (m.source !== CandidateType.DICT
                    && m.source !== CandidateType.FUNCTION_NAME) {
                expect(m.handle).toBeDefined()
                expect(m.updateText.startsWith('{')).toBe(true)
            }
        })
    }
})
