/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

// tslint:disable: no-single-line-block-comment naming-convention
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// tslint:disable: ext-variable-name variable-name member-ordering
import {BooleanInput} from '@angular/cdk/coercion'
import {
    DOWN_ARROW,
    ENTER,
    ESCAPE,
    SPACE,
    TAB,
    UP_ARROW,
} from '@angular/cdk/keycodes'
import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay'
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling'
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Self,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core'
import {ControlValueAccessor, NgControl} from '@angular/forms'
import {InputBoolean} from '@logi/src/web/ui/common/utils'
import {SafeAny} from '@logi/src/web/ui/core'
import {BehaviorSubject, combineLatest, merge, Subject, timer} from 'rxjs'
import {startWith, takeUntil} from 'rxjs/operators'

import {OptionPayload, SelectedOptionPayload, SelectMode} from './interface'
import {LogiComboboxOptionGroupComponent} from './option-group.component'
import {LogiComboboxOptionComponent} from './option.component'
import {LogiComboboxTriggerComponent} from './trigger.component'

function defaultFilterFn(searchKey: string, item: OptionPayload): boolean {
    if (item && item.label)
        return item.label
            .toString()
            .toLowerCase()
            .indexOf(searchKey.toLowerCase()) > -1
    return false
}

export type LogiComboboxSize = 'default' | 'large' | 'small'

// tslint:disable: no-empty unknown-instead-of-any
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    host: {
        '(blur)': 'onBlur()',
        '[class.logi-combobox-small]': 'size === "small"',
        '[class.logi-combobox-large]': 'size === "large"',
        '[class.logi-combobox-disabled]': 'disabled',
        '[class.logi-combobox-multiple]': 'multiple',
        '[class.logi-combobox-open]': 'panelOpen',
        '[class.logi-combobox-single]': '!multiple',
        class: 'logi-combobox',
    },
    selector: 'logi-combobox',
    styleUrls: ['./combobox.component.scss'],
    templateUrl: './combobox.component.html',
})
export class LogiComboboxComponent implements ControlValueAccessor, OnInit,
OnDestroy, AfterContentInit {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
        @Self() @Optional() private readonly _ngControl: NgControl,
        private readonly _cd: ChangeDetectorRef,
    ) {
        /**
         * Provide value accessor here to avoid running into a circular dep.
         */
        if (this._ngControl)
            this._ngControl.valueAccessor = this
    }
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_showSearch: BooleanInput
    public static ngAcceptInputType_noborder: BooleanInput

    @Input() @InputBoolean() disabled = false
    @Input() @InputBoolean() noborder = false

    @Input() public labelContentTpl: TemplateRef<any> | null = null
    @Input() public customPanelClass = ''
    @Input() public fixedPanelWidth = 0
    @Input() public panelClass = ''
    @Input() public placeholder = '请选择'
    @Input() public emptyText = '无选项'
    @Input() public ripple = false
    @Input() public innerLabel = ''
    @Input() public dropdownIcon = 'ic_arrow_down'
    @Input() public mode: SelectMode = 'default'
    @Input() size: LogiComboboxSize = 'default'
    @Input() public loading = false
    @Input() @InputBoolean() showSearch = false
    /** 最多选中多少个值 */
    @Input() public maxSelectCount = Infinity
    /** 最多显示多少个选中值(其余的会合并为一个) */
    @Input() public maxShowTagCount = Infinity
    @Input() public itemSize = 32
    @Input() maxItemLength = 8
    /** 比较两个Option值是否相等 */
    @Input() compareWith: (o1: SafeAny, o2: SafeAny) => boolean =
        (o1: SafeAny, o2: SafeAny) => o1 === o2
    @Input() filterFn = defaultFilterFn

    @Output() readonly valueChange$ = new EventEmitter<SafeAny>()
    @Input() public set value(value: any) {
        this.writeValue(value)
    }

    public get value(): any {
        return this._value
    }

    public get multiple(): boolean {
        return this.mode === 'multiple'
    }

    @ContentChildren(LogiComboboxOptionComponent, {descendants: true})
    public optionList!: QueryList<LogiComboboxOptionComponent>
    @ContentChildren(LogiComboboxOptionGroupComponent, {descendants: true})
    public optionGroupList!: QueryList<LogiComboboxOptionComponent>
    @ViewChild(LogiComboboxTriggerComponent, {static: true})
    readonly triggerComponent!: LogiComboboxTriggerComponent

    activatedValue: SafeAny | null = null
    public scrollItems: readonly OptionPayload[] = []
    public panelOpen = false
    public panelWidth = 120
    public optionPayload$ = new BehaviorSubject<readonly OptionPayload[]>([])
    public values$ = new BehaviorSubject<readonly SafeAny[]>([])
    valueList: readonly SafeAny[] = []
    selectedOptions: readonly OptionPayload[] = []

    public ngOnInit(): void {
        combineLatest([this.values$, this.optionPayload$])
            .pipe(takeUntil(this._destroy$))
            // @ts-ignore
            // tslint:disable-next-line: no-unused
            .subscribe(([_, optionPayloads]) => {
                this._optionTemplateItems = optionPayloads
                this.selectedOptions = this.valueList
                    .map(
                        v => [...this._optionTemplateItems, ...this.selectedOptions]
                            .find(i => this.compareWith(v, i.value)),
                    )
                    .filter((i): i is OptionPayload => !!i)
                this.updateScrollItems()
            })
    }

    public ngAfterContentInit(): void {
        this._onOptionContentChange()
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()
    }

    // tslint:disable-next-line: prefer-function-over-method
    trackScrollItem(_: number, option: OptionPayload): SafeAny {
        return option.key
    }

    // tslint:disable-next-line: cyclomatic-complexity
    onKeydown(event: KeyboardEvent): void {
        if (this.disabled)
            return
        const items = this.scrollItems.filter(item =>
            item.type === 'item' && !item.disabled)
        const index = items.findIndex(item =>
            this.compareWith(item.value, this.activatedValue))
        switch (event.keyCode) {
        case UP_ARROW:
            event.preventDefault()
            if (this.panelOpen) {
                const preIndex = index > 0 ? index - 1 : items.length - 1
                this.activatedValue = items[preIndex].value
            }
            this.scrollIntoActivatedOption()
            break
        case DOWN_ARROW:
            event.preventDefault()
            if (this.panelOpen) {
                const nextIndex = index < items.length - 1 ? index + 1 : 0
                this.activatedValue = items[nextIndex].value
            } else
                this.setOpenState(true)
            this.scrollIntoActivatedOption()
            break
        case ENTER:
            event.preventDefault()
            if (this.panelOpen)
                if (this.activatedValue !== undefined && this.activatedValue)
                    this.onItemClick(this.activatedValue)
                else
                this.setOpenState(true)
            break
        case SPACE:
            if (!this.panelOpen) {
                this.setOpenState(true)
                event.preventDefault()
            }
            break
        case TAB:
            this.setOpenState(false)
            break
        case ESCAPE:
            break
        default:
            if (!this.panelOpen)
                this.setOpenState(true)
        }
    }

    /** 搜索关键字变化 */
    onSearchChange(value: string): void {
        this._searchKey = value
        this.updateScrollItems()
        this.updateCdkConnectedOverlayPosition()
    }

    /** 删除已选中的值 */
    onDeleteSelected(option: SelectedOptionPayload): void {
        const value = this.valueList
            .filter(v => !this.compareWith(v, option.value))
        this.updateValueList(value)
    }

    /** 点击选项 */
    onItemClick(value: SafeAny): void {
        this.activatedValue = value
        if (this.mode === 'default') {
            if (this.valueList.length === 0 || !this
                .compareWith(this.valueList[0], value))
                this.updateValueList([value])
            this.setOpenState(false)
        } else {
            const targetIndex = this.valueList
                .findIndex(o => this.compareWith(o, value))
            if (targetIndex !== -1) {
                const listOfValueAfterRemoved = this.valueList.filter((
                    _,
                    i,
                ) => i !== targetIndex)
                this.updateValueList(listOfValueAfterRemoved)
            } else if (this.valueList.length < this.maxSelectCount) {
                const listOfValueAfterAdded = [...this.valueList, value]
                this.updateValueList(listOfValueAfterAdded)
            }
            this.triggerComponent.focus()
            this.clearSearchKey()
        }
    }

    updateValueList(valueList: readonly SafeAny[]): void {
        const covertListToModel = (
            list: readonly SafeAny[],
            mode: SelectMode,
        ): SafeAny[] | SafeAny => {
            if (mode === 'default')
                return list.length > 0 ? list[0] : null
            return list.length > 0 ? list : null
        }
        const model = covertListToModel(valueList, this.mode)
        if (this.value === model)
            return
        this.valueList = valueList
        this.values$.next(valueList)
        this.value = model
        this._onChange(this.value)
        this.valueChange$.next(this.value)
    }

    clearSearchKey(): void {
        this.triggerComponent.clearSearchKey()
    }

    public onBlur(): void {
        if (!this.disabled && !this.panelOpen) {
            this._onTouched()
            this._cd.markForCheck()
        }
    }

    public togglePanel(): void {
        if ((this.panelOpen && this.showSearch) || this.disabled)
            return
        this.setOpenState(!this.panelOpen)
    }

    public setOpenState(value: boolean): void {
        if (value === this.panelOpen)
            return
        this._cd.markForCheck()
        this.panelOpen = value
        this.onPanelOpenChange()
    }

    public onPanelOpenChange(): void {
        this.updatePanelStatus()
        this.clearSearchKey()
    }

    public onAttach(): void {
        timer().subscribe(() => {
            this.scrollIntoSelectedOption()
        })
    }

    public focus(): void {
        this._el.nativeElement.focus()
    }

    public registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn
    }

    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn
    }

    public writeValue(value: SafeAny | readonly SafeAny[]): void {
        if (this._value === value)
            return
        this._value = value
        const covertModelToList = (
            model: SafeAny[] | SafeAny,
            mode: SelectMode,
        ): SafeAny[] => {
            if (model === null || model === undefined)
                return []
            if (mode === 'default')
                return [model]

            return model
        }
        const listOfValue = covertModelToList(value, this.mode)
        this.valueList = listOfValue
        this.values$.next(listOfValue)
        this._cd.markForCheck()
    }

    public updateScrollItems(): void {
        const scrollItems = this._optionTemplateItems
            .filter(item => !item.hide)
            .filter(item =>
                this._searchKey ? this.filterFn(this._searchKey, item) : true)
        const activatedItem = scrollItems.find(
            item => this.compareWith(item.value, this.valueList[0]),
        ) || scrollItems[0]
        this.activatedValue = (activatedItem && activatedItem.value) || null
        let groupLabels: (string | TemplateRef<SafeAny> | null)[] = []
        if (this.optionGroupList)
            groupLabels = this.optionGroupList.map(g => g.label)
        groupLabels.forEach(label => {
            const index = scrollItems
                .findIndex(item => label === item.groupLabel)
            if (index === -1)
                return
            const groupItem: OptionPayload = {
                groupLabel: label,
                key: label,
                label: null,
                type: 'group',
                value: null,
            }
            scrollItems.splice(index, 0, groupItem)
        })
        this.scrollItems = [...scrollItems]
        this.updateCdkConnectedOverlayPosition()
    }

    public updatePanelStatus(): void {
        const origin = this._originElement.nativeElement
        if (!origin)
            return
        this.panelWidth = this.fixedPanelWidth > 0 ?
            this.fixedPanelWidth :
            origin.getBoundingClientRect().width
    }

    onScrolledIndexChange(index: number): void {
        this._scrolledIndex = index
    }

    scrollIntoSelectedOption(): void {
        const value = Array.isArray(this.value) ? this.value[0] : this.value
        const index = this.scrollItems.findIndex(item =>
                this.compareWith(item.value, value))
        if (index < this._scrolledIndex ||
            index >= this._scrolledIndex + this.maxItemLength)
            this._cdkVirtualScrollViewport?.scrollToIndex(index || 0)
    }

    scrollIntoActivatedOption(): void {
        const index = this.scrollItems
            .findIndex(item => this.compareWith(item.key, this.activatedValue))
        if (index < this._scrolledIndex ||
            index >= this._scrolledIndex + this.maxItemLength)
            this._cdkVirtualScrollViewport?.scrollToIndex(index || 0)
    }

    updateCdkConnectedOverlayPosition(): void {
        requestAnimationFrame(() => {
            this._cdkConnectedOverlay?.overlayRef?.updatePosition()
        })
    }

    private readonly _destroy$ = new Subject<void>()
    @ViewChild(CdkOverlayOrigin, {static: true, read: ElementRef})
    private readonly _originElement!: ElementRef<HTMLElement>
    @ViewChild(CdkConnectedOverlay, {static: true})
    private readonly _cdkConnectedOverlay!: CdkConnectedOverlay

    @ViewChild(CdkVirtualScrollViewport)
    private _cdkVirtualScrollViewport?: CdkVirtualScrollViewport

    private _value: any
    private _optionTemplateItems: readonly OptionPayload[] = []
    private _scrolledIndex = 0
    private _searchKey = ''

    private _onOptionContentChange(): void {
        const change$ =
            merge(this.optionList.changes, this.optionGroupList.changes)
                .pipe(startWith(true), takeUntil(this._destroy$))
        change$.subscribe(() => {
            const optionPayloads = this.optionList.toArray().map((
                o,
            ): OptionPayload => {
                return {
                    ...o,
                    disabled: o.disabled,
                    groupLabel: o.groupLabel,
                    key: o.value,
                    type: 'item',
                }
            })
            this.optionPayload$.next(optionPayloads)
        })
    }
    private _onChange: (value: any) => void = () => {}
    private _onTouched = (): void => {}
}
