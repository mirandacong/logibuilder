import {Style, Vertical, View} from '@logi/base/ts/common/excel'

import {BaseStyle} from './defs'

export interface Options {
    readonly sheet: SheetOption
    readonly table: TableOption
    readonly cell: CellOption
    readonly title: TitleOption
    readonly topMargin: TopMarginOption
    // tslint:disable-next-line: unknown-instead-of-any
    getBaseStyle(base: BaseStyle, depth?: number): Style
    updateStyle(style: Style, ...args: readonly unknown[]): Style
}

export interface SheetOption {
    readonly endRowCount: number
    readonly endColCount: number
    readonly defaultRowHeight: number
    readonly defaultColWidth: number
    readonly defaultVertAlign: Vertical
    readonly marginColWidth: number
    readonly view: View
}

export interface TableOption {
    readonly stubWidth: number
    readonly rowHeight: number
    readonly minColumnWidth: number
}

export interface CellOption {
    readonly decimalFormat: string
    readonly numberFormat: string
    readonly diffSheetFontColor: string
    readonly directFormalu: string
    readonly manualSource: string
    readonly databaseSource: string
}

export interface TitleOption {
    readonly rowHeight: number
    readonly intervalHeight: number
    update(base: Style, depth: number): Style
}

export interface TopMarginOption {
    readonly backColor: string
    readonly font: string
    readonly content: string
}
