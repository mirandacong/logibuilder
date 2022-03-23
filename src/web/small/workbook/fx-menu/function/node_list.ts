import {
    AddItem,
    AddItemBuilder,
    ToolbarBtnType,
} from '@logi/src/web/core/editor/node-edit/add_list'

export function getAddItems(): readonly AddItem[] {
    return [
        new AddItemBuilder()
            .icon(ToolbarBtnType.UP)
            .type(ToolbarBtnType.UP)
            .text('上移')
            .disabled(true)
            .build(),
        new AddItemBuilder()
            .icon(ToolbarBtnType.DOWN)
            .type(ToolbarBtnType.DOWN)
            .text('下移')
            .disabled(true)
            .build(),
        new AddItemBuilder()
            .icon(ToolbarBtnType.LEVEL_UP)
            .type(ToolbarBtnType.LEVEL_UP)
            .text('升级')
            .disabled(true)
            .build(),
        new AddItemBuilder()
            .icon(ToolbarBtnType.LEVEL_DOWN)
            .type(ToolbarBtnType.LEVEL_DOWN)
            .text('降级')
            .disabled(true)
            .build(),
    ]
}
