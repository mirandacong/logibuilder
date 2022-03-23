// tslint:disable: no-console
// tslint:disable: ordered-imports
import {useDebugMode} from '@logi/base/ts/common/debug'
useDebugMode()
import {EditorService, EditorServiceBuilder} from '@logi/src/lib/api/services'
import {NodeType} from '@logi/src/lib/hierarchy/core'
import {readFileSync} from 'fs'

import {LoadFileActionBuilder} from './editor'
import {handle} from './handle'
import {AddChildActionBuilder} from './hierarchy'

function main(): void {
    const service = new EditorServiceBuilder().build()
    loadFile(service)
    console.log('\n---------------------------------------------------\n')
    addChild(service)
}

/**
 * The average time for load file action in nodejs is
 *  exprPlugin:     620 ms
 *  udfRefPlugin:   53 ms
 *  hsfPlugin:      2150 ms
 * The cost in browser may be twice except hsf.
 */
function loadFile(service: EditorService): void {
    console.log('\nStart load file action.\n')
    const modelPath = `${__dirname}/test_data.logi`
    const buf = readFileSync(modelPath)
    const action = new LoadFileActionBuilder().buffer(buf).build()
    handle(action, service)
}

/**
 * The average time for add child action in nodejs is
 *  exprPlugin:     180 ms
 *  udfRefPlugin:   18 ms
 *  hsfPlugin:      370 ms
 * The cost in browser may be twice except hsf.
 */
function addChild(service: EditorService): void {
    console.log('\nStart add child action.\n')
    // tslint:disable-next-line: no-magic-numbers
    const table = service.book.sheets[5].tree[0]
    const action = new AddChildActionBuilder()
        .name('')
        .target(table.uuid)
        .type(NodeType.COLUMN)
        .build()
    handle(action, service)
}

main()
