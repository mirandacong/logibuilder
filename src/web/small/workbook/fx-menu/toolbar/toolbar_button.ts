import {
    AddItem,
    AddItemBuilder,
    ToolbarBtnType,
} from '@logi/src/web/core/editor/node-edit/add_list'

export function simpleEditList(): readonly AddItem[] {
    return[
        new AddItemBuilder()
            .icon(ToolbarBtnType.UNDO)
            .text('撤销(Ctrl+Z)')
            .disabled(true)
            .build(),
        new AddItemBuilder()
            .icon(ToolbarBtnType.REDO)
            .text('重做(Ctril+ Y)')
            .disabled(true)
            .build(),
    ]
}

export function nodeEditList(): readonly AddItem[] {
    return[
        new AddItemBuilder()
            .icon(ToolbarBtnType.REMOVE)
            .type(ToolbarBtnType.REMOVE)
            .text('删除')
            .disabled(true)
            .build(),
        new AddItemBuilder()
            .icon(ToolbarBtnType.LOAD_TEMPLATE)
            .type(ToolbarBtnType.LOAD_TEMPLATE)
            .text('从库导入')
            .disabled(false)
            .build(),
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
