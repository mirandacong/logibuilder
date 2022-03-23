import {CandidateGroup} from './candidate'
import {Trigger} from './trigger'
/**
 * Provide the candidates.
 */
export interface Provider {
    suggest(input: Readonly<Trigger>): readonly Readonly<CandidateGroup>[]
}

/**
 * When the input is an empty string, tell the provider which actions should be
 * taken.
 */
export const enum EmptyStrategy {
    ALL,
    EMPTY,
}
