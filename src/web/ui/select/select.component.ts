// tslint:disable
/* eslint-disable */
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion'
import {SelectionModel} from '@angular/cdk/collections'
import {CdkOverlayOrigin} from '@angular/cdk/overlay'
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling'
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    Self,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core'
import {ControlValueAccessor, NgControl} from '@angular/forms'
import {defer, merge, Observable, Subject, timer} from 'rxjs'
import {startWith, switchMap, take, takeUntil} from 'rxjs/operators'

import {
    LogiOptionComponent,
    LogiOptionSelectChange,
    LOGI_OPTION_PARENT_COMPONENT,
} from './option.component'

export type SelectMode = 'default' | 'multiple'

export type LogiSelectSize = 'default' | 'small' | 'large'

export interface VirtualScrollItem<T> {
    readonly label: string
    readonly value: T
}

export class LogiSelectChange {
    // tslint:disable: codelyzer-template-property-should-be-public
    // tslint:disable-next-line: parameter-properties unknown-instead-of-any
    public constructor(public source: LogiSelectComponent, public value: any) {}
}

// tslint:disable: no-empty unknown-instead-of-any no-null-keyword
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    // tslint:disable-next-line: use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '(blur)': 'onBlur()',
        '[class.logi-select-disabled]': 'disabled',
        '[class.logi-select-multiple]': 'multiple',
        '[class.logi-select-single]': '!multiple',
        '[class.logi-select-small]': 'size === "small"',
        '[class.logi-select-large]': 'size === "large"',
        class: 'logi-select',
    },
    providers: [
        {
            provide: LOGI_OPTION_PARENT_COMPONENT,
            useExisting: LogiSelectComponent,
        },
    ],
    selector: 'logi-select',
    styleUrls: ['./select.style.scss'],
    templateUrl: './select.template.html',
})
export class LogiSelectComponent implements ControlValueAccessor, OnInit,
OnDestroy, AfterContentInit, AfterViewInit {
    public constructor(
        private readonly _el: ElementRef<HTMLElement>,
        @Self() @Optional() private readonly _ngControl: NgControl,
        private readonly _zone: NgZone,
        private readonly _cd: ChangeDetectorRef,
    ) {
        /**
         * Provide value accessor here to avoid running into a circular dep.
         */
        if (this._ngControl)
            this._ngControl.valueAccessor = this
    }
    public static ngAcceptInputType_disabled: BooleanInput
    public static ngAcceptInputType_searchable: BooleanInput
    public static ngAcceptInputType_noborder: BooleanInput
    @Input() size: LogiSelectSize = 'default'

    @Input() public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value)
    }

    public get disabled(): boolean {
        return this._disabled
    }

    @Input() public set searchable(value: boolean) {
        this._searchable = coerceBooleanProperty(value)
    }

    public get searchable(): boolean {
        return this._searchable
    }

    @Input() public set value(value: any) {
        if (this._value !== value) {
            this.writeValue(value)
            this._value = value
        }
    }

    public get value(): any {
        return this._value
    }

    @Input() public set noborder(value: boolean) {
        this._noborder = coerceBooleanProperty(value)
    }

    public get noborder(): boolean {
        return this._noborder
    }

    public get multiple(): boolean {
        return this.mode === 'multiple'
    }

    public get selectedOption(): LogiOptionComponent | undefined {
        if (this.empty)
            return
        return this.selectionModel.selected[0]
    }

    public get selectedOptions(): readonly LogiOptionComponent[] {
        if (this.empty)
            return []
        return this.selectionModel.selected
    }

    public get selected(
    ): LogiOptionComponent | readonly LogiOptionComponent[] {
        return this.multiple ? this.selectionModel.selected :
            this.selectionModel.selected[0]
    }

    public get empty(): boolean {
        return !this.selectionModel || this.selectionModel.isEmpty()
    }

    @Input() public labelContentTpl: TemplateRef<any> | null = null
    @Input() public customPanelClass = ''
    @Input() public fixedPanelWidth = 0
    @Input() public panelClass = ''
    @Input() public placeholder = '请选择'
    @Input() public emptyText = '无选项'
    @Input() public dropdownIcon = 'ic_arrow_down'
    @Input() public mode: SelectMode = 'default'
    @Input() public maxSelectNum = Infinity

    /**
     * @deprecated
     * 使用 combobox 代替
     */
    @Input() public virtualScrollItems: readonly VirtualScrollItem<any>[] = []
    @Input() public virtualScrollItemSize = 32

    @Output() public readonly valueChange$ = new EventEmitter<any>()
    @Output()
    public readonly selectChange$ = new EventEmitter<LogiSelectChange>()
    @Output() public readonly closePanel$ = new EventEmitter<void>()

    @ContentChildren(LogiOptionComponent, {descendants: true})
    public options!: QueryList<LogiOptionComponent>

    public panelOpen = false
    public triggerWidth = 120
    public selectionModel!: SelectionModel<LogiOptionComponent>

    public ngOnInit(): void {
        this.selectionModel = new SelectionModel<LogiOptionComponent>(
            this.multiple,
        )
    }

    public ngAfterContentInit(): void {
        this.selectionModel.changed
            .pipe(takeUntil(this._destroy$))
            .subscribe(event => {
                event.added.forEach(option => option.select())
                event.removed.forEach(option => option.deselect())
            })
        this.options.changes
            .pipe(startWith(null), takeUntil(this._destroy$))
            .subscribe(() => {
                this._resetOptions()
                this._initializeSelection()
            })
    }

    public ngAfterViewInit(): void {
        this._updatePanelStyle()
    }

    public ngOnDestroy(): void {
        this._destroy$.next()
        this._destroy$.complete()
    }

    public onVirtualScrollSelectChange(change: LogiOptionSelectChange): void {
        this._onSelect(change.source, change.isUserInput)
        if (!this.multiple && this.panelOpen)
            this.closePanel()
    }

    public hasPanelActions(): boolean {
        if (!this._panelActionsRef)
            return false
        const element = this._panelActionsRef.nativeElement
        return element.children.length > 0
    }

    public onSearch(key: string): void {
        this.options.forEach(option => {
            const label = option.label
            option.hide = false
            if (!label.includes(key))
                option.hide = true
        })
    }

    public onDeleteOption(option: LogiOptionComponent): void {
        if (option === undefined)
            return
        this.selectionModel.deselect(option)
        this._sortSelection()
        this._propagateChanges()
    }

    public onBlur(): void {
        if (!this.disabled && !this.panelOpen) {
            this._onTouched()
            this._cd.markForCheck()
        }
    }

    public togglePanel(): void {
        this.panelOpen ? this.closePanel() : this.openPanel()
    }

    public openPanel(): void {
        if (this.disabled || this.panelOpen)
            return
        this.panelOpen = true
        this._updatePanelStyle()
    }

    public onAttach(): void {
        this._scrollToSelected()
    }

    public closePanel(): void {
        if (!this.panelOpen)
            return
        this.options.forEach(option => {
            option.hide = false
        })
        this.panelOpen = false
        this.closePanel$.next()
        this._cd.markForCheck()
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

    public writeValue(value: any): void {
        if (this.options === undefined)
            return
        this._setSelectionByValue(value)
    }

    private readonly _destroy$ = new Subject<void>()
    @ViewChild(CdkOverlayOrigin, {static: true, read: ElementRef})
    private readonly _originElement!: ElementRef<HTMLElement>

    // tslint:disable-next-line: no-type-assertion
    private _optionSelectChange$ = defer(() => {
        const options = this.options
        if (options)
            return options.changes.pipe(startWith(options), switchMap(
                () => merge(...options.map(option => option.selectChange$)),
            ))
        return this._zone.onStable.asObservable().pipe(take(1), switchMap(() =>
            this._optionSelectChange$))
    }) as Observable<LogiOptionSelectChange>

    @ViewChild('panel_actions')
    private readonly _panelActionsRef?: ElementRef<HTMLElement>
    @ViewChild(CdkVirtualScrollViewport)
    private _cdkVirtualScrollViewport?: CdkVirtualScrollViewport
    @ViewChildren(LogiOptionComponent)
    private _virtualScrollOptions?: QueryList<LogiOptionComponent>

    private _disabled = false
    private _searchable = false
    private _noborder = false
    private _value: any
    private _onChange: (value: any) => void = () => {}
    private _onTouched = (): void => {}
    /**
     * Comparison function to specify which option is displayed. Defaults to
     * object equality.
     */
    private _compareWith = (o1: any, o2: any) => o1 === o2

    private _updatePanelStyle(): void {
        const origin = this._originElement.nativeElement
        if (origin === undefined)
            return
        this.triggerWidth = this.fixedPanelWidth > 0 ?
            this.fixedPanelWidth :
            origin.getBoundingClientRect().width
    }

    private _initializeSelection(): void {
        /**
         * Defer setting the value in order to avoid the "Expression has changed
         * after it was checked" errors from Angular.
         */
        Promise.resolve().then(() => {
            const value = this._ngControl ? this._ngControl.value : this._value
            this._setSelectionByValue(value)
        })
    }

    private _resetOptions(): void {
        const changedOrDestroyed = merge(this.options.changes, this._destroy$)
        this._optionSelectChange$.pipe(takeUntil(changedOrDestroyed)).subscribe(
            event => {
                this._onSelect(event.source, event.isUserInput)
                if (!this.multiple && this.panelOpen)
                    this.closePanel()
            },
        )
    }

    private _onSelect(option: LogiOptionComponent, isUserInput: boolean): void {
        const wasSelected = this.selectionModel.isSelected(option)
        if (option.value === null && !this.multiple) {
            option.deselect()
            this.selectionModel.clear()
            this._propagateChanges(option.value)
        } else {
            if (wasSelected !== option.selected)
                option.selected ? this.selectionModel.select(option) :
                    this.selectionModel.deselect(option)
            if (this.multiple) {
                const selectedOptions = this.selectionModel.selected
                if (selectedOptions.length > this.maxSelectNum)
                    this.selectionModel.deselect(selectedOptions[0])
                this._sortSelection()
                if (isUserInput)
                    this.focus()
            }
        }

        if (wasSelected !== this.selectionModel.isSelected(option))
            this._propagateChanges()
    }

    private _propagateChanges(fallbackValue?: unknown): void {
        // tslint:disable-next-line: no-null-keyword unknown-instead-of-any
        let valueToEmit: any = null
        if (this.multiple)
            valueToEmit =
                // tslint:disable-next-line: no-type-assertion
                (this.selected as LogiOptionComponent[]).map(o => o.value)
        else
            valueToEmit = this.selected ?
                // tslint:disable-next-line: no-type-assertion
                (this.selected as LogiOptionComponent).value : fallbackValue

        this.valueChange$.emit(valueToEmit)
        this._onChange(valueToEmit)
        this.selectChange$.emit(new LogiSelectChange(this, valueToEmit))
        this._cd.markForCheck()
    }

    private _sortSelection(): void {
        if (!this.multiple)
            return
        const options = this.options.toArray()
        this.selectionModel.sort((a, b) =>
            options.indexOf(a) - options.indexOf(b))
    }

    private _setSelectionByValue(value: any | readonly any[]): void {
        this.selectionModel.clear()

        if (this.multiple && value) {
            if (!Array.isArray(value))
                return
            value.forEach(v => this._selectValue(v))
            this._sortSelection()
        } else
            this._selectValue(value)
        this._cd.markForCheck()
    }

    private _selectValue(value: any): LogiOptionComponent | undefined {
        if (this.virtualScrollItems.length !== 0 && this._virtualScrollOptions) {
            const option = this._virtualScrollOptions.find(o =>
                o.value !== null && o.value !== undefined && this
                    ._compareWith(o.value, value))
            if (option !== undefined)
                this.selectionModel.select(option)
            return option
        }
        const option = this.options.find(o =>
            o.value !== null && o.value !== undefined && this
                ._compareWith(o.value, value))
        if (option !== undefined)
            this.selectionModel.select(option)
        return option
    }

    private _scrollToSelected(): void {
        if (this.virtualScrollItems.length !== 0 && this.selectionModel.selected.length) {
            const index = this.virtualScrollItems.findIndex(item => this
                ._compareWith(
                    item.value,
                    this.selectionModel.selected[0].value,
                ))
            if (index !== -1)
                timer().subscribe(() => {
                    this._cdkVirtualScrollViewport?.scrollToIndex(index || 0)
                })
            return
        }
        const option = this.options.find(o => o.selected)
        if (option === undefined)
            return
        option.getHostElement().scrollIntoView()
    }
}
