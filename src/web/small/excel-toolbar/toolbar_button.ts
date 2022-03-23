import {FontFamily, Underline} from '@logi/src/lib/modifier'
import {
    ToolbarBtnType as BtnIcon,
} from '@logi/src/web/core/editor/node-edit/add_list'
import {Operator} from '@logi/src/web/core/excel-preview/operator'
import {ToolbarButton, ToolbarButtonBuilder, ToolbarType} from './toolbar_type'

// tslint:disable-next-line: max-func-body-length
export function fxExcelToolbar (): readonly ToolbarButton[] {
    return [
        new ToolbarButtonBuilder()
            .type(ToolbarType.ZOOM)
            .tooltip('缩放')
            .operator(Operator.ZOOM)
            .build(),
        new ToolbarButtonBuilder().type(ToolbarType.DIVIDER).build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.CURRENCY])
            .operator(Operator.CURRENCY)
            .tooltip('采用货币格式')
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.PERCENT])
            .operator(Operator.PERCENT)
            .tooltip('格式为百分比')
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.SEPARATOR])
            .operator(Operator.SEPARATOR)
            .tooltip('千分位符')
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.POINT_INC])
            .operator(Operator.POINT_INC)
            .tooltip('减少小数位')
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.POINT_DEC])
            .operator(Operator.POINT_DEC)
            .tooltip('增加小数位')
            .build(),
        new ToolbarButtonBuilder().type(ToolbarType.DIVIDER).build(),
        new ToolbarButtonBuilder()
            .tooltip('字体')
            .operator(Operator.FONT_FAMILY)
            .type(ToolbarType.SELECT)
            .menuButtons(FONT_FAMILY_LIST)
            .value('Calibri')
            .build(),
        new ToolbarButtonBuilder()
            .tooltip('字号')
            .operator(Operator.FONT_SIZE)
            .type(ToolbarType.FONT_SIZE)
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.BOLD])
            .operator(Operator.BOLD)
            .tooltip('加粗')
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.ITALIC])
            .operator(Operator.ITALIC)
            .tooltip('斜体')
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.UNDERLINE])
            .operator(Operator.UNDERLINE)
            .tooltip('下划线')
            .value(Underline.SINGLE)
            .build(),
        new ToolbarButtonBuilder()
            .icons([BtnIcon.STRIKETHROUGH])
            .operator(Operator.STRIKETHROUGH)
            .value(Underline.SINGLE_ACCOUNTING)
            .tooltip('删除线')
            .build(),
    ]
}

const FONT_FAMILY_LIST: readonly ToolbarButton[] = [
    new ToolbarButtonBuilder()
        .operator(Operator.FONT_FAMILY)
        .value(FontFamily.CALIBRI)
        .build(),
]
