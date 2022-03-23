import {buildTestModel2} from '@logi/src/lib/dsl/logi_test_data'
import {RowBlock, Table} from '@logi/src/lib/hierarchy/core'
import {readFileSync} from 'fs'
import {join} from 'path'

import {EditorLocationBuilder, Location} from '../../editor/events/base'
import {Hint, HintBuilder} from '../input'

// tslint:disable-next-line:unknown-instead-of-any
type JsonObj = any

export function readHints(): readonly Hint[] {
    const book = buildTestModel2().book
    const row = ((book.sheets[0].tree[0] as Table).rows[1] as RowBlock).tree[0]
    const path = join(__dirname, './hint.json')
    const data = readFileSync(path, 'utf-8')
    const hints = JSON.parse(data) as any
    return hints.map((h: JsonObj): Hint => new HintBuilder()
        .prefix(h.prefix as string)
        .suffix(h.suffix as string)
        .text(h.text as string)
        .filters([])
        .location(new EditorLocationBuilder()
            .node(row)
            .loc(Location.RIGHT)
            .build())
        .build())
}
