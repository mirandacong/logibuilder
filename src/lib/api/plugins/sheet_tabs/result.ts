import {Builder} from '@logi/base/ts/common/builder'

import {PluginType, Result} from '../base'

export interface SheetTabsResult extends Result {
    readonly sheetTabs: readonly SheetTab[]
    /**
     * active sheet name
     */
    readonly activeSheet: string
    equals(sheetTabsResult: SheetTabsResult): boolean
    activeIndex(): number
}

class SheetTabsResultImpl implements SheetTabsResult {
    public actionType = PluginType.SHEET_TABS
    public sheetTabs: readonly SheetTab[] = []
    public activeSheet = ''
    public equals(sheetTabsResult: SheetTabsResult): boolean {
        if (this.activeSheet !== sheetTabsResult.activeSheet)
            return false
        if (this.sheetTabs.length !== sheetTabsResult.sheetTabs.length)
            return false
        const tabs = sheetTabsResult.sheetTabs
        return this.sheetTabs.every((t, i) => t.equals(tabs[i]))
    }

    public activeIndex(): number {
        const i = this.sheetTabs.findIndex(t => t.name === this.activeSheet)
        return i === -1 ? 0 : i
    }
}

export class SheetTabsResultBuilder
extends Builder<SheetTabsResult, SheetTabsResultImpl> {
    public constructor(obj?: Readonly<SheetTabsResult>) {
        const impl = new SheetTabsResultImpl()
        if (obj)
            SheetTabsResultBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public sheetTables(sheetTabs: readonly SheetTab[]): this {
        this.getImpl().sheetTabs = sheetTabs
        return this
    }

    public activeSheet(activeSheet: string): this {
        this.getImpl().activeSheet = activeSheet
        return this
    }
}

export function isSheetTabsResult(value: unknown): value is SheetTabsResult {
    return value instanceof SheetTabsResultImpl
}

export function assertIsSheetTabsResult(
    value: unknown,
): asserts value is SheetTabsResult {
    if (!(value instanceof SheetTabsResultImpl))
        throw Error('Not a SheetTabsResult!')
}

export interface SheetTab {
    readonly name: string,
    readonly isCustom: boolean,
    equals(sheetTab: SheetTab): boolean
}

class SheetTabImpl implements SheetTab {
    public name!: string
    public isCustom!: boolean
    public equals(sheetTab: SheetTab): boolean {
        return this.name === sheetTab.name
            && this.isCustom === sheetTab.isCustom
    }
}

export class SheetTabBuilder extends Builder<SheetTab, SheetTabImpl> {
    public constructor(obj?: Readonly<SheetTab>) {
        const impl = new SheetTabImpl()
        if (obj)
            SheetTabBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public isCustom(isCustom: boolean): this {
        this.getImpl().isCustom = isCustom
        return this
    }

    protected get daa(): readonly string[] {
        return SheetTabBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = [
        'name',
        'isCustom',
    ]
}

export function isSheetTab(value: unknown): value is SheetTab {
    return value instanceof SheetTabImpl
}

export function assertIsSheetTab(value: unknown): asserts value is SheetTab {
    if (!(value instanceof SheetTabImpl))
        throw Error('Not a SheetTab!')
}
