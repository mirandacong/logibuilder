import {ComponentPortal} from '@angular/cdk/portal'
import {ContextMenuItem} from '@logi/src/web/common/context-menu'
import {PaletteComponent} from '@logi/src/web/common/palette'

import {EditorBase} from './base'

// tslint:disable-next-line: max-func-body-length
export function getContextMenu (
    comp: EditorBase,
): ReadonlyArray<ContextMenuItem> {
    return [
        {
            click: (): void => comp.onCloseSheet(),
            divider: false,
            enabled: true,
            html: (): string => '删除',
            visible: true,
        },
        {
            click: (): void => comp.copy(),
            divider: false,
            enabled: true,
            html: (): string => '复制',
            // tslint:disable-next-line: unknown-instead-of-any
            visible: (item: any) => !item.isCustom,
        },
        {
            click: (): void => comp.changeSheetName(),
            divider: false,
            enabled: true,
            html: (): string => '重命名',
            // tslint:disable-next-line: unknown-instead-of-any
            visible: (item: any) => !item.isCustom,
        },
        {
            // tslint:disable-next-line: no-empty
            click: (): void => { },
            divider: false,
            enabled: true,
            html: (): string => '更改颜色',
            subMenu: [{
                click: (color: string): void => comp.setColor(color),
                divider: false,
                enabled: true,
                html: (): string => '',
                portal:
                    new ComponentPortal<PaletteComponent>(PaletteComponent),
                visible: true,
            }],
            // tslint:disable-next-line: unknown-instead-of-any
            visible: (item: any) => !item.isCustom,
        },
        {
            divider: true,
            enabled: true,
            html: (): string => '',
            // tslint:disable-next-line: unknown-instead-of-any
            visible: (item: any) => !item.isCustom,
        },
        {
            divider: true,
            enabled: true,
            html: (): string => '',
            // tslint:disable-next-line: unknown-instead-of-any
            visible: (item: any) => !item.isCustom,
        },
        {
            click: (): void => comp.cleanData(),
            divider: false,
            enabled: true,
            html: (): string => '清除输入数据',
            // tslint:disable-next-line: unknown-instead-of-any
            visible: (item: any) => !item.isCustom,
        },
    ]
}
