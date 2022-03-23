// tslint:disable: no-magic-numbers
// tslint:disable-next-line: no-import-side-effect
import '@logi/base/ts/spreadjs/spreadjs_init'

// tslint:disable-next-line: no-wildcard-import ordered-imports
import * as GC from '@grapecity/spread-sheets'
import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'

import {HSF_VERSION} from '../version'

/**
 * Find the cell in the cover sheet whose value is the id of the model.
 */
export function getIdentifiedCell(
    sheet: GC.Spread.Sheets.Worksheet,
): GC.Spread.Sheets.CellRange {
    const row = 0
    const col = 0
    return sheet.getCell(row, col)
}

export function getModelIdCell(
    sheet: GC.Spread.Sheets.Worksheet,
): GC.Spread.Sheets.CellRange {
    const row = 0
    const col = 1
    return sheet.getCell(row, col)
}

export function getProjIdCell(
    sheet: GC.Spread.Sheets.Worksheet,
): GC.Spread.Sheets.CellRange {
    const row = 0
    const col = 2
    return sheet.getCell(row, col)
}

export function getVersionCell(
    sheet: GC.Spread.Sheets.Worksheet,
): GC.Spread.Sheets.CellRange {
    const row = 1
    const col = 0
    return sheet.getCell(row, col)
}

export const COVER_NAME = 'Cover'

// tslint:disable-next-line: max-func-body-length
export function getCoverSheet(
    data: CoverData,
    modelUuid: string,
): GC.Spread.Sheets.Worksheet {
    const sheet = new GC.Spread.Sheets.Worksheet(COVER_NAME)
    sheet.options.isProtected = true
    sheet.options.gridline.showHorizontalGridline = false
    sheet.options.gridline.showVerticalGridline = false
    const defaultStyle = new GC.Spread.Sheets.Style()
    defaultStyle.font = '11pt Calibri'
    sheet.setDefaultStyle(defaultStyle)
    setSizeAndFill(sheet)
    const uuidCell = getIdentifiedCell(sheet)
    setStyle(uuidCell, modelUuid, 10, '#2D4A86')
    setVersion(sheet)
    const modelIdCell = getModelIdCell(sheet)
    setStyle(modelIdCell, data.modelId, 10, '#2D4A86')
    const projIdCell = getProjIdCell(sheet)
    setStyle(projIdCell, data.projId, 10, '#2D4A86')
    const projNameCell = sheet.getCell(3, 1)
    const projName = data.projName
    const corpFontColor = '#FFFFFF'
    setStyle(projNameCell, projName, 48, corpFontColor)
    const corpNameCell = sheet.getCell(5, 1)
    const corpName = data.corpName
    setStyle(corpNameCell, corpName, 16, corpFontColor)
    const stockCodeCell = sheet.getCell(6, 1)
    const stockCode = data.stockCode
    setStyle(stockCodeCell, stockCode, 16, corpFontColor)
    const industryCell = sheet.getCell(7, 1)
    const industry = data.industry
    setStyle(industryCell, industry, 16, corpFontColor)
    const modelNameCell = sheet.getCell(16, 1)
    const modelName = data.modelName
    setStyle(modelNameCell, modelName, 32, '#7F7F7F')
    const cell1 = sheet.getCell(18, 1)
    setStyle(cell1, '最后更新', 16, '#7F7F7F')
    const cell2 = sheet.getCell(19, 1)
    setStyle(cell2, '编辑者', 16, '#7F7F7F')
    const lastModifiedCell = sheet.getCell(18, 2)
    const lastModified = data.lastModified
    setStyle(lastModifiedCell, lastModified, 16, '#000000')
    const editorCell = sheet.getCell(19, 2)
    const editor = data.editor
    setStyle(editorCell, editor, 16, '#000000')
    const notification = sheet.getCell(28, 1)
    setNotificationStyle(notification, '说明', 12, '#000000')
    const notification1 = sheet.getCell(30, 1)
    setNotificationStyle(
        notification1,
        '1. 请勿删除此模板中所有标识为由逻辑式生成的工作表。',
        12,
        '#000000',
    )
    const notification2 = sheet.getCell(31, 1)
    setNotificationStyle(
        notification2,
        '2. 此模板中所有标识为由逻辑式生成的表格中，灰色背景标识的“事实”数据，及浅蓝色背景标识的“假设”数据，用户可以手动填入或修改数据；无背景色的单元格不可修改。',
        12,
        '#000000',
    )
    const factData = sheet.getCell(33, 1)
    setNotificationStyle(factData, '事实数据', 13, '#000000')
    factData.hAlign(GC.Spread.Sheets.HorizontalAlign.right)
    factData.backColor('#f5f5f5')
    const asmData = sheet.getCell(34, 1)
    setNotificationStyle(asmData, '假设数据', 13, '#000000')
    asmData.hAlign(GC.Spread.Sheets.HorizontalAlign.right)
    asmData.backColor('#e0f5fb')
    const border = new GC.Spread.Sheets.LineBorder('#78ccdd', GC.Spread.Sheets.LineStyle.dashed)
    asmData.setBorder(border, {all: true})
    const custom = data.custom
    const customCell = sheet.getCell(37, 1)
    setFooterStyle(customCell, custom)
    return sheet
}

function setSizeAndFill(sheet: GC.Spread.Sheets.Worksheet): void {
    const rowCount = 38
    const columnCount = 11
    sheet.setRowCount(rowCount)
    sheet.setColumnCount(columnCount)
    for (let i = 0; i < rowCount; i += 1)
        for (let j = 0; j < columnCount; j += 1) {
            if (i === 0)
                if (j === 1 || j === 2)
                    sheet.setColumnWidth(j, 256)
                else
                    sheet.setColumnWidth(j, 61)
            if (j === 0)
                if (i === 3)
                    sheet.setRowHeight(i, 64)
                else if (i === 16)
                    sheet.setRowHeight(i, 48)
                else
                    sheet.setRowHeight(i, 21)
            const c = sheet.getCell(i, j)
            if (i < 12)
                c.backColor('#2D4A86')
            else if (i < 37)
                c.backColor('#FFFFFF')
            else
                c.backColor('#BB1839')
        }
}

function setVersion(sheet: GC.Spread.Sheets.Worksheet): void {
    const cell = getVersionCell(sheet)
    const version = getHsfVersionStr()
    setStyle(cell, version, 10, '#2D4A86')
}

function getHsfVersionStr(): string {
    return `version-${HSF_VERSION.toString()}`
}

export function parseHsfVersion(versionStr: string): number {
    const res = versionStr.match(/^version-(.*)$/)
    if (res === null)
        return 0
    const version = res[1]
    return Number(version)
}

function setFooterStyle(c: GC.Spread.Sheets.CellRange, value: string): void {
    c.font('normal bold 13.3px Calibri')
    c.foreColor('#FFFFFF')
    c.hAlign(3)
    c.vAlign(1)
    c.value(value)
}

function setNotificationStyle(
    // tslint:disable-next-line: max-params
    c: GC.Spread.Sheets.CellRange,
    value: string,
    fontSize: number,
    fontColor: string,
): void {
    c.font(`normal normal ${fontSize}px Calibri`)
    c.foreColor(fontColor)
    c.hAlign(3)
    c.vAlign(1)
    c.value(value)
}

function setStyle(
    // tslint:disable-next-line: max-params
    c: GC.Spread.Sheets.CellRange,
    value: string,
    fontSize: number,
    fontColor: string,
): void {
    c.font(`normal bold ${fontSize}px Calibri`)
    c.foreColor(fontColor)
    c.hAlign(3)
    c.vAlign(1)
    c.value(value)
}

export interface CoverData {
    readonly projId: string
    readonly projName: string
    readonly corpName: string
    readonly stockCode: string
    readonly industry: string
    readonly modelId: string
    readonly modelName: string
    readonly lastModified: string
    readonly editor: string
    readonly custom: string
}

class CoverDataImpl implements Impl<CoverData> {
    public projId!: string
    public projName!: string
    public corpName!: string
    public stockCode!: string
    public industry!: string
    public modelId!: string
    public modelName!: string
    public lastModified!: string
    public editor!: string
    public custom!: string
}

export class CoverDataBuilder extends Builder<CoverData, CoverDataImpl> {
    public constructor(obj?: Readonly<CoverData>) {
        const impl = new CoverDataImpl()
        if (obj)
            CoverDataBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public projId(projId: string): this {
        this.getImpl().projId = projId
        return this
    }

    public projName(projName: string): this {
        this.getImpl().projName = projName
        return this
    }

    public corpName(corpName: string): this {
        this.getImpl().corpName = corpName
        return this
    }

    public stockCode(stockCode: string): this {
        this.getImpl().stockCode = stockCode
        return this
    }

    public industry(industry: string): this {
        this.getImpl().industry = industry
        return this
    }

    public modelId(modelId: string): this {
        this.getImpl().modelId = modelId
        return this
    }

    public modelName(modelName: string): this {
        this.getImpl().modelName = modelName
        return this
    }

    public lastModified(lastModified: string): this {
        this.getImpl().lastModified = lastModified
        return this
    }

    public editor(editor: string): this {
        this.getImpl().editor = editor
        return this
    }

    public custom(custom: string): this {
        this.getImpl().custom = custom
        return this
    }

    protected get daa(): readonly string[] {
        return CoverDataBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'projId',
        'projName',
        'corpName',
        'industry',
        'stockCode',
        'modelId',
        'modelName',
        'lastModified',
        'editor',
        'custom',
    ]
}

export function isCoverData(value: unknown): value is CoverData {
    return value instanceof CoverDataImpl
}

export function assertIsCoverData(value: unknown): asserts value is CoverData {
    if (!(value instanceof CoverDataImpl))
        throw Error('Not a CoverData!')
}
