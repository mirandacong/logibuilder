import {Builder} from '@logi/base/ts/common/builder'
import {preOrderWalk2} from '@logi/base/ts/common/walk_utils'
import {
    HierarchyPayload,
    SetAliasPayloadBuilder,
} from '@logi/src/lib/api/payloads'
import {EditorService} from '@logi/src/lib/api/services'
import {
    getNodesVisitor,
    getSubnodes,
    isRow,
    Node,
    NodeType,
    Row,
} from '@logi/src/lib/hierarchy/core'

import {ActionType} from '../type'

import {Action as Base} from './base'
import {updateRdepAlias} from './lib'

/**
 * Remove the alias in rows those are not needed.
 */
// tslint:disable-next-line: no-empty-interface
export interface Action extends Base {}

class ActionImpl implements Action {
    public actionType = ActionType.REMOVE_REDUNDANT_ALIAS
    // tslint:disable-next-line: prefer-function-over-method
    public getPayloads(service: EditorService): readonly HierarchyPayload[] {
        const payloads: HierarchyPayload[] = []
        const rows = preOrderWalk2(
            service.book,
            getNodesVisitor,
            [NodeType.ROW],
        )
        rows.forEach((r: Readonly<Node>): void => {
            if (!isRow(r) || r.alias === '')
                return
            const sibilings = getSiblingRows(r)
            const res = sibilings.find((s: Readonly<Row>): boolean =>
                s.name === r.name)
            if (res !== undefined)
                return
            const alias = new SetAliasPayloadBuilder()
                .uuid(r.uuid)
                .alias('')
                .build()
            payloads.push(alias)
            payloads.push(...updateRdepAlias(r, '', service))
        })
        return payloads
    }
}

export class ActionBuilder extends Builder<Action, ActionImpl> {
    public constructor(obj?: Readonly<Action>) {
        const impl = new ActionImpl()
        if (obj)
            ActionBuilder.shallowCopy(impl, obj)
        super(impl)
    }
}

export function isAction(value: unknown): value is Action {
    return value instanceof ActionImpl
}

function getSiblingRows(row: Readonly<Row>): readonly Readonly<Row>[] {
    const parent = row.parent
    if (parent === null)
        return []
    return getSubnodes(parent).filter((s: Readonly<Node>): s is Row =>
        isRow(s) && s !== row)
}
