import {EditorService} from '@logi/src/lib/api/services'
import {Node} from '@logi/src/lib/hierarchy/core'

/**
 * Use in excel to find hierarchy node by click a cell in spreadjs sheet.
 */
export function findNode(
    // tslint:disable-next-line: max-params
    row: number,
    col: number,
    sheetName: string,
    service: Readonly<EditorService>,
): Readonly<Node> | undefined {
    const nodeId = service.hsfManager.getNode(sheetName, row, col)
    if (nodeId === undefined)
        return
    const map = service.bookMap
    return map.get(nodeId)
}
