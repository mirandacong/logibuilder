import {Builder} from '@logi/base/ts/common/builder'
import {
    AbbrSeekerBuilder,
    Seeker,
    Target,
} from '@logi/src/lib/intellisense/algo'
import {
    ViewPartBuilder,
    ViewType,
} from '@logi/src/lib/intellisense/editor/display'

import {
    Candidate,
    CandidateBuilder,
    CandidateGroup,
    CandidateGroupBuilder,
    CandidateType,
} from '../candidate'
import {Provider} from '../provider'
import {Trigger} from '../trigger'

class DictProviderImpl implements Provider {
    public seeker!: Seeker
    public suggest(
        input: Readonly<Trigger>,
    ): readonly Readonly<CandidateGroup>[] {
        const target = this.seeker.seek(input.text)
        const candidates = target.map((c: Readonly<Target>): Candidate => {
            const cursorLoc = `${input.prefix}${c.content}`.length
            return new CandidateBuilder()
                .view([new ViewPartBuilder()
                    .content(c.content)
                    .matchedMap(c.matchedMap)
                    .type(ViewType.DICT)
                    .build()])
                .prefix(input.prefix)
                .updateText(c.content)
                .suffix(input.suffix)
                .cursorOffest(cursorLoc)
                .source(CandidateType.DICT)
                .from(input.from)
                .build()
        })
        return [new CandidateGroupBuilder()
            .members(candidates)
            .filters([])
            .build()]
    }
}

export class DictProviderBuilder extends Builder<Provider, DictProviderImpl> {
    public constructor(obj?: Readonly<Provider>) {
        const impl = new DictProviderImpl()
        if (obj)
            DictProviderBuilder.shallowCopy(obj, impl)
        super(impl)
    }

    public data(value: readonly string[]): this {
        this.getImpl().seeker = new AbbrSeekerBuilder()
            .data(value)
            .caseSensitive(false)
            .build()
        return this
    }
    protected static __DAA_PROPS__: readonly string[] = ['seeker']

    protected get daa(): readonly string[] {
        return DictProviderBuilder.__DAA_PROPS__
    }
}
