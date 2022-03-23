import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {ToolbarBtnType} from '@logi/src/web/core/editor/node-edit/add_list'
import {Operator} from '@logi/src/web/core/excel-preview/operator'
export const ZOOM_LIST: readonly string[] = ['50%', '75%', '90%', '100%', '125%', '150%', '200%']

export const FONT_SIZE_LIST: readonly number[]
    // tslint:disable-next-line: no-magic-numbers
    = [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 36]
// tslint:disable-next-line: const-enum
export enum ShowType {
    LOGI_SHEET,
    CUSTOM_SHEET,
}

// tslint:disable-next-line: const-enum
export enum ToolbarType {
    DEFAULT,
    PLURAL,
    DIVIDER,
    ZOOM,
    FONT_SIZE,
    SELECT,
    SUBMENU,
}

export interface ToolbarButton {
    readonly show: readonly ShowType[],
    readonly tooltip: string,
    readonly selected: boolean,
    readonly icons: readonly ToolbarBtnType[],
    readonly disabled: boolean,
    readonly operator: Operator,
    readonly type: ToolbarType,
    readonly value: unknown,
    readonly submenu: string,
    readonly menuButtons: readonly ToolbarButton[],
    updateShow (show: readonly ShowType[]): void,
    updateSelected (sel: boolean): void,
    updateDisabled (disabled: boolean): void,
    updateValue (value: unknown): void,
    updateIcons (icons: readonly ToolbarBtnType[]): void,
}

class ToolbarButtonImpl implements Impl<ToolbarButton> {
    public show: readonly ShowType[] = [ShowType.CUSTOM_SHEET]
    public tooltip!: string
    public selected!: boolean
    public icons: readonly ToolbarBtnType[] = []
    public disabled!: boolean
    public operator!: Operator
    public type: ToolbarType = ToolbarType.DEFAULT
    public value!: unknown
    public submenu!: string
    public menuButtons: readonly ToolbarButton[] = []
    public updateShow (show: readonly ShowType[]): void {
        this.show = show
    }

    public updateSelected (sel: boolean): void {
        this.selected = sel
    }

    public updateDisabled (disabled: boolean): void {
        this.disabled = disabled
    }

    public updateValue (value: unknown): void {
        this.value = value
    }

    public updateIcons (icons: readonly ToolbarBtnType[]): void {
        this.icons = icons
    }
}

export class ToolbarButtonBuilder extends
    Builder<ToolbarButton, ToolbarButtonImpl> {
    public constructor(obj?: Readonly<ToolbarButton>) {
        const impl = new ToolbarButtonImpl()
        if (obj)
            ToolbarButtonBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public show (show: readonly ShowType[]): this {
        this.getImpl().show = show
        return this
    }

    public tooltip (tooltip: string): this {
        this.getImpl().tooltip = tooltip
        return this
    }

    public selected (selected: boolean): this {
        this.getImpl().selected = selected
        return this
    }

    public icons (icons: readonly ToolbarBtnType[]): this {
        this.getImpl().icons = icons
        return this
    }

    public disabled (disabled: boolean): this {
        this.getImpl().disabled = disabled
        return this
    }

    public operator (operator: Operator): this {
        this.getImpl().operator = operator
        return this
    }

    public type (type: ToolbarType): this {
        this.getImpl().type = type
        return this
    }

    public value (value: unknown): this {
        this.getImpl().value = value
        return this
    }

    public submenu (submenu: string): this {
        this.getImpl().submenu = submenu
        return this
    }

    public menuButtons (menuButtons: readonly ToolbarButton[]): this {
        this.getImpl().menuButtons = menuButtons
        return this
    }

    protected get daa (): readonly string[] {
        return ToolbarButtonBuilder.__DAA_PROPS__
    }
    // tslint:disable-next-line: no-empty-daa-props
    protected static readonly __DAA_PROPS__: readonly string[] = []
}

export function isToolbarButton (value: unknown): value is ToolbarButton {
    return value instanceof ToolbarButtonImpl
}

export function assertIsToolbarButton (
    value: unknown,
): asserts value is ToolbarButton {
    if (!(value instanceof ToolbarButtonImpl))
        throw Error('Not a ToolbarButton!')
}
