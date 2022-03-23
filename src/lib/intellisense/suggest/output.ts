import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {CandidateGroup} from './solutions'

export interface Suggestion {
    readonly candidateGroups: readonly CandidateGroup[]
}

class SuggestionImpl implements Impl<Suggestion> {
    public candidateGroups: readonly CandidateGroup[] = []
}

export class SuggestionBuilder extends Builder<Suggestion, SuggestionImpl> {
    public constructor(obj?: Readonly<Suggestion>) {
        const impl = new SuggestionImpl()
        if (obj)
            SuggestionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public candidateGroups(page: readonly CandidateGroup[]): this {
        this.getImpl().candidateGroups = page
        return this
    }

    protected get daa(): readonly string[] {
        return SuggestionBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'candidateGroups',
    ]
}

export function isSuggestion(obj: object): obj is Suggestion {
    return obj instanceof SuggestionImpl
}
