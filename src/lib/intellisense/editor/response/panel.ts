import {
    PanelItem,
    PanelItemBuilder,
    PanelResponse,
    PanelResponseBuilder,
    PanelTabBuilder,
} from '@logi/src/lib/intellisense/editor/display'

import {PanelStatus, PanelUnit} from '../status/panel'

export function getPanelResponse(
    status: PanelStatus,
    show: boolean,
): Readonly<PanelResponse> {
    if (status.page.length === 0 || !show)
        return new PanelResponseBuilder()
            .tab(new PanelTabBuilder().items([]).selected(-1).build())
            .build()
    const curr = status.page
    const items = curr.map((u: PanelUnit): PanelItem => {
        const builder = new PanelItemBuilder().parts(u.parts)
        if (u.nodeMsg !== undefined)
            builder.resolvedNode(u.nodeMsg)
        return builder.build()
    })
    const tab = new PanelTabBuilder()
        .items(items)
        .selected(status.selected)
        .build()
    return new PanelResponseBuilder().tab(tab).build()
}
