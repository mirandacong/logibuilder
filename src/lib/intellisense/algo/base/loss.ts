import {Builder} from '@logi/base/ts/common/builder'

import {getEditDist} from './edit_distance'
import {getLcsLen} from './lcs'

export interface Paras {
    /**
     * Only when the number of matched characters exceeds or less than (depends
     * on the match method) `matchThreshold` would we consider this
     * match succeeds.
     */
    readonly matchThreshold: number
    /**
     * The reduction ratio when a match succeeds.
     *
     * For example, given the `matchThreshold` = 3,
     * LCS('aaa', 'banana') = 'aaa' and it is considered to be matched.
     * But apparently 'baaa' makes a better match with 'banana' and it should
     * has a fewer loss. We condiser the
     * `loss = (1 - matchRatio) * reductionRatio` where matchRatio is the ratio
     * of matched chararceters.
     */
    readonly reductionRatio: number
    /**
     * If this match is not successful, use `defaultLoss`.
     */
    readonly defaultLoss?: number
}

class ParasImpl implements Paras {
    public matchThreshold!: number
    public reductionRatio = 0
    public defaultLoss?: number
}

export class ParasBuilder extends Builder<Paras, ParasImpl> {
    public constructor(obj?: Readonly<Paras>) {
        const impl = new ParasImpl()
        if (obj)
            ParasBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public matchThreshold(value: number): this {
        this.getImpl().matchThreshold = value
        return this
    }

    public reductionRatio(value: number): this {
        this.getImpl().reductionRatio = value
        return this
    }

    public defaultLoss(value: number): this {
        this.getImpl().defaultLoss = value
        return this
    }
}

/**
 * Calculate the loss in the lcs match.
 *
 * Sometimes we do not care which character is matched but only how much this
 * segments match the target.
 * Notice: If this match is not successful, return -1 rather than 1.
 */
export function getLcsLoss(
    s1: string,
    s2: string,
    config: Paras,
): number {
    const lcsLen = getLcsLen(s1, s2)
    if (lcsLen < config.matchThreshold)
        return -1
    const ratio = config.reductionRatio
    const maxLen = s1.length > s2.length ? s1.length : s2.length
    const matchRatio = lcsLen / maxLen
    // tslint:disable-next-line:no-magic-numbers
    return Math.floor((1 - matchRatio) * ratio * 100) / 100
}

export function getEditDistLoss(
    s1: string,
    s2: string,
    config: Paras,
): number {
    const editDist = getEditDist(s1, s2)
    if (editDist >= config.matchThreshold)
        return -1
    const ratio = config.reductionRatio
    const targetLen = s2.length
    const matchRatio = (targetLen - editDist) / targetLen
    // tslint:disable-next-line: no-magic-numbers
    return Math.floor((1 - matchRatio) * ratio * 100) / 100
}
