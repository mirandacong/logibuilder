import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {lcsLenMatch} from '@logi/src/lib/intellisense/algo'

import {Location} from '../editor/events/base'

import {Hint} from './input'
import {Suggestion, SuggestionBuilder} from './output'
import {
    BaseProviderBuilder,
    CandidateGroup,
    CandidateType,
    FunctionProvider,
    KeywordProvider,
    PathProvider,
    Provider,
    SliceProvider,
    Trigger,
    TriggerBuilder,
    TriggerType,
} from './solutions'
import {DictProviderBuilder} from './solutions/providers/dict'

/**
 * Receive the editor event and emit the suggestions.
 */
export interface Adviser {
    getSuggestion(source: Hint): Suggestion

}

class AdviserImpl implements Impl<Adviser> {
    public dictProvider!: Provider
    public functionNameProvider = new FunctionProvider()
    public pathProvider = new PathProvider()
    public keywordProvider = new KeywordProvider()
    public refnameProvider = new BaseProviderBuilder()
        .fn(lcsLenMatch)
        .source(CandidateType.REFNAME)
        .build()

    public sliceProvider = new SliceProvider()

    public getSuggestion(source: Hint): Suggestion {
        const trigger = buildTrigger(source)
        const semi = this._getSemiSuggestion(trigger)
        return semi.build()
    }

    private _getSemiSuggestion(
        trigger: Readonly<Trigger>,
    ): Readonly<SemiSuggestion> {
        switch (trigger.type) {
        case TriggerType.REFERENCE: {
            const candidates = this.refnameProvider.suggest(trigger)
            return new SemiSuggestion(candidates)
        }
        case TriggerType.FUNCTION: {
            const candidates = this.functionNameProvider.suggest(trigger)
            return new SemiSuggestion(candidates)
        }
        case TriggerType.PATH: {
            const candidates = this.pathProvider.suggest(trigger)
            return new SemiSuggestion(candidates)
        }
        case TriggerType.DICT: {
            const candidates = this.dictProvider.suggest(trigger)
            return new SemiSuggestion(candidates)
        }
        case TriggerType.SLICE: {
            const candidates = this.sliceProvider.suggest(trigger)
            return new SemiSuggestion(candidates)
        }
        case TriggerType.FUNC_OR_REF: {
            const funcCands = this.functionNameProvider.suggest(trigger)
            const refCands = this.refnameProvider.suggest(trigger)
            const keywordCands = this.keywordProvider.suggest(trigger)
            return new SemiSuggestion([
                ...funcCands,
                ...refCands,
                ...keywordCands,
            ])
        }
        default: {
            return new SemiSuggestion([])
        }
        }
    }
}

export class AdviserBuilder extends Builder<Adviser, AdviserImpl> {
    public constructor(obj?: Readonly<Adviser>) {
        const impl = new AdviserImpl()
        if (obj)
            AdviserBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    /**
     * Set the vocabulries which will be suggested using an abbr trie.
     */
    public dict(data: readonly string[]): this {
        this.getImpl().dictProvider = new DictProviderBuilder()
            .data(data)
            .build()
        return this
    }
}

// tslint:disable-next-line: max-func-body-length
function buildTrigger(hint: Hint): Trigger {
    if (hint.filters.length > 0)
        return new TriggerBuilder()
            .type(TriggerType.REFERENCE)
            .filters(hint.filters)
            .text(hint.text.replace('{', '').replace('}', ''))
            .node(hint.location.node)
            .build()

    /**
     * Definition suggestion trigger.
     */
    if (hint.location.loc === Location.LEFT)
        return new TriggerBuilder()
            .type(TriggerType.DICT)
            .text(hint.text)
            .node(hint.location.node)
            .prefix(hint.prefix)
            .suffix(hint.suffix)
            .build()

    /**
     * Function only suggesstion trigger.
     */
    if (hint.text.startsWith('.') &&
        (hint.prefix.endsWith(')') || hint.prefix.endsWith('}')))
        return new TriggerBuilder()
            .type(TriggerType.FUNCTION)
            .text(hint.text)
            .node(hint.location.node)
            .prefix(hint.prefix)
            .suffix(hint.suffix)
            .build()

    if (hint.text.startsWith('['))
        return new TriggerBuilder()
            .type(TriggerType.SLICE)
            .text(hint.text)
            .node(hint.location.node)
            .prefix(hint.prefix)
            .suffix(hint.suffix)
            .build()

    /**
     * Function or reference without `{}` suggesstion trigger.
     */
    if (!hint.text.startsWith('{') && !hint.text.startsWith('.'))
        return new TriggerBuilder()
            .type(TriggerType.FUNC_OR_REF)
            .text(hint.text)
            .node(hint.location.node)
            .prefix(hint.prefix)
            .suffix(hint.suffix)
            .build()

    /**
     * Path suggestion trigger.
     */
    if (hint.text.indexOf('!') > 0)
        return new TriggerBuilder()
            .type(TriggerType.PATH)
            .text(hint.text.replace('{', '').replace('}', ''))
            .node(hint.location.node)
            .prefix(hint.prefix)
            .suffix(hint.suffix)
            .build()

    return new TriggerBuilder()
        .type(TriggerType.REFERENCE)
        .text(hint.text.replace('{', '').replace('}', ''))
        .node(hint.location.node)
        .prefix(hint.prefix)
        .suffix(hint.suffix)
        .build()
}

class SemiSuggestion {
    public constructor(
        public readonly candidateGroups: readonly CandidateGroup[]) {}

    // tslint:disable-next-line: no-unnecessary-method-declaration
    public build(): Suggestion {
        return new SuggestionBuilder()
            .candidateGroups(this.candidateGroups)
            .build()
    }
}
