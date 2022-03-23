import {isException} from '@logi/base/ts/common/exception'
import {preOrderWalk} from '@logi/base/ts/common/walk_utils'
import {
    getNodesVisitor,
    isTable,
    Node,
    NodeType,
    PathBuilder,
    resolve,
} from '@logi/src/lib/hierarchy/core'
import {lcsLenMatch} from '@logi/src/lib/intellisense/algo'
import {
    ViewPartBuilder,
    ViewType,
} from '@logi/src/lib/intellisense/editor/display'
import {getTags} from '@logi/src/lib/intellisense/utils'

import {
    Candidate,
    CandidateBuilder,
    CandidateGroup,
    CandidateGroupBuilder,
    CandidateType,
} from '../candidate'
import {Provider} from '../provider'
import {sortCandidates} from '../sort'
import {Trigger} from '../trigger'

export class SliceProvider implements Provider {
    // tslint:disable-next-line:prefer-function-over-method max-func-body-length
    public suggest(
        trigger: Readonly<Trigger>,
    ): readonly Readonly<CandidateGroup>[] {
        const newText = trigger.text
        if (newText === '')
            return []
        const candidates: Readonly<Candidate>[] = []
        const matched = trigger.prefix.match(/{.*?}$/)
        if (matched === null)
            return []
        const ref = matched[0].slice(1, matched[0].length - 1)
        const path = PathBuilder.buildFromString(ref)
        if (isException(path))
            return []
        const nodes = resolve(path, trigger.node)
        if (nodes.length === 0)
            return []
        const target = nodes[0]
        const table = target.getTable()
        if (!isTable(table))
            return []
        const cols = preOrderWalk(
            table,
            getNodesVisitor,
            [NodeType.COLUMN, NodeType.COLUMN_BLOCK],
        )
        const tagSet = new Set<string>()
        cols.forEach((n: Readonly<Node>): void => {
            const res = getTags(n)
            res.forEach(r => tagSet.add(r))
        })
        const tags: string[] = Array
            .from(tagSet)
            .sort((a: string, b: string): number => a < b ? -1 : 1)
        const slice = trigger.text.slice(1, trigger.text.length - 1)
        const infos = lcsLenMatch(slice, tags, false)
        infos.forEach((info: readonly [string, Map<number, number>]): void => {
            const update = `[${info[0]}]`
            const view = new ViewPartBuilder()
                .content(info[0])
                .matchedMap(info[1])
                .type(ViewType.SLICE)
                .build()
            const candi = new CandidateBuilder()
                .from(trigger.from)
                .prefix(trigger.prefix)
                .suffix(trigger.suffix)
                .updateText(update)
                .cursorOffest(trigger.prefix.length + update.length)
                .source(CandidateType.SELECTION)
                .view([view])
                .build()
            candidates.push(candi)
        })
        const members = candidates.sort(
            (a: Readonly<Candidate>, b: Readonly<Candidate>): number =>
            sortCandidates(a, b, trigger.node),
        )
        return [new CandidateGroupBuilder()
            .filters([])
            .members(members)
            .build()]
    }
}
