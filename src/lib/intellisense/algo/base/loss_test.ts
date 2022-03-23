import {getEditDistLoss, getLcsLoss, ParasBuilder} from './loss'

describe('loss_test', (): void => {
    it('lcs', (): void => {
        const config = new ParasBuilder()
            .matchThreshold(0)
            .defaultLoss(0)
            .reductionRatio(1)
            .build()
        const s1 = 'aaa'
        const s2 = 'baaa'
        const target = 'banana'
        const l1 = getLcsLoss(s1, target, config)
        const l2 = getLcsLoss(s2, target, config)
        expect(l1).toBeGreaterThan(l2)
    })
    it('editDist', (): void => {
        const config = new ParasBuilder()
            // tslint:disable-next-line: no-magic-numbers
            .matchThreshold(10)
            .defaultLoss(0)
            .reductionRatio(1)
            .build()
        const s1 = 'aaa'
        const s2 = 'baaa'
        const target = 'banana'
        const l1 = getEditDistLoss(s1, target, config)
        const l2 = getEditDistLoss(s2, target, config)
        expect(l1).toBeGreaterThan(l2)
    })
})
