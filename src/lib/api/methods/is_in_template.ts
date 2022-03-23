import {EditorService} from '@logi/src/lib/api/services'
import {Node} from '@logi/src/lib/hierarchy/core'
import {Template} from '@logi/src/lib/template'

export function isInTemplate(
    node: Readonly<Node>,
    service: EditorService,
): boolean {
    let root = node
    while (root.parent !== null)
        root = root.parent
    return service.templateSet.templates.find((
        t: Readonly<Template>,
    ): boolean => t.node.uuid === root.uuid) !== undefined
}
