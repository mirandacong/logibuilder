import {getSignature, supportedOpInfoNames} from '@logi/src/lib/dsl/semantic'
import {
    AbbrSeekerBuilder,
    EmptyStrategy,
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

/**
 * An expert provider that provides functions.
 */
export class FunctionProvider implements Provider {
    public constructor() {
        this._init()
    }

    public suggest(
        trigger: Readonly<Trigger>,
    ): readonly Readonly<CandidateGroup>[] {
        const text = trigger.text
        const targets: Readonly<Target>[] = []
        const afterDot = text.startsWith('.') ? true : false
        if (!afterDot)
            targets.push(...this._seekers[0].seek(text))
        else
            targets.push(...this._seekers[1].seek(text))
        const candidates = targets.map((target: Target): Candidate => {
            const updateText = `${target.content}()`
            const sign = getSignature(target.content)
            let cursorLoc = `${trigger.prefix}${updateText}`.length
            if (sign !== undefined &&
                sign.args.length > 0 && sign.args[0].isRequired)
                cursorLoc -= 1
            return new CandidateBuilder()
                .view([new ViewPartBuilder()
                    .content(updateText)
                    .matchedMap(target.matchedMap)
                    .type(ViewType.FUNCTION)
                    .build()])
                .source(CandidateType.FUNCTION_NAME)
                .cursorOffest(cursorLoc)
                .prefix(trigger.prefix)
                .updateText(updateText)
                .suffix(trigger.suffix)
                .from(trigger.from)
                .build()
        })
        return [new CandidateGroupBuilder()
            .filters([])
            .members(candidates)
            .build()]
    }

    private _seekers!: readonly Readonly<Seeker>[]

    private _init(): void {
        const ops = supportedOpInfoNames()
        const prefix = ops
            .filter((c: string): boolean => !c.startsWith('.'))
            .map((c: string): string => c.toUpperCase())
        const suffix = ops
            .filter((c: string): boolean => c.startsWith('.'))
            .map((c: string): string => c.toLowerCase())
        this._seekers = [
            new AbbrSeekerBuilder().data(prefix).build(),
            new AbbrSeekerBuilder()
                .data(suffix)
                .emptyStrategy(EmptyStrategy.ALL)
                .build(),
        ]
    }
}
