import {getAllKeyWords, KeywordFeature} from '@logi/src/lib/compute/op'
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

export class KeywordProvider implements Provider {
    public constructor() {
        this._init()
    }

    public suggest(
        trigger: Readonly<Trigger>,
    ): readonly Readonly<CandidateGroup>[] {
        const text = trigger.text
        const targets = this._seeker.seek(text)
        const candidates = targets.map((target: Target): Candidate => {
            const cursorLoc = `${trigger.prefix}${target.content}`.length
            return new CandidateBuilder()
                .view([new ViewPartBuilder()
                    .content(target.content)
                    .matchedMap(target.matchedMap)
                    .type(ViewType.KEYWORD)
                    .build()])
                .source(CandidateType.KEYWORD)
                .cursorOffest(cursorLoc)
                .prefix(trigger.prefix)
                .updateText(target.content)
                .suffix(trigger.suffix)
                .from(trigger.from)
                .build()
        })
        return [new CandidateGroupBuilder()
            .filters([])
            .members(candidates)
            .build()]
    }
    private _seeker!: Readonly<Seeker>

    private _init(): void {
        const keyWords = getAllKeyWords()
            .filter((f: KeywordFeature): boolean => !f.isInternal)
            .map((k: KeywordFeature): string => k.image)
        this._seeker = new AbbrSeekerBuilder().data(keyWords).build()
    }
}
