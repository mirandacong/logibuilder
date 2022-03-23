import {Part, Path} from '@logi/src/lib/hierarchy/core'
import {getLcsLoss, ParasBuilder} from '@logi/src/lib/intellisense/algo'
import {getTags} from '@logi/src/lib/intellisense/utils'

export function matchTemplateRef(path: Path, beMatched: string): number {
    const targets = beMatched.split('!')
    const parts = path.parts
    const tags: string[] = []
    parts.forEach((part: Part): void => {
        tags.push(...getTags(part))
    })
    let confidence = 1
    // tslint:disable-next-line: no-loop
    for (const target of targets) {
        let loss = 1
        let matched = false // Indicate if this target is matched any tag.
        // tslint:disable-next-line: no-loop
        for (const tag of tags) {
            const paras = new ParasBuilder()
                .matchThreshold(Math.min(tag.length, target.length))
                // tslint:disable-next-line:no-magic-numbers
                .reductionRatio(1 / targets.length * 0.7)
                .build()
            const l = getLcsLoss(tag, target, paras)
            if (l < 0)
                continue
            matched = true
            if (l < loss)
                loss = l
        }
        if (!matched)
            loss = 1 / targets.length
        confidence -= loss
    }

    return confidence > 0 ? confidence : 0
}
